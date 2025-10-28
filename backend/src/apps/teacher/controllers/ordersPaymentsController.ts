import { Request, Response } from "express";
import Transaction from "../models/Transaction.model";
import UnlockCode from "../models/UnlockCode.model";
import Course from "../models/Course.model";
import CourseEnrollment from "../models/CourseEnrollment";
import { Types } from "mongoose";
import crypto from 'crypto';
import auditLogger from '@core/lib/audit-logger';

// Generate a unique unlock code
function generateUnlockCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i > 0 && i % 2 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Hash the code for storage
function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// Create offline transaction and generate unlock code
export const createOfflineTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = (res as any).locals.admin;
    const { buyerName, contact, paymentReferenceType, paymentReference, paymentMethod, courseId, amount, notes } = req.body;

    if (!buyerName || !contact || !paymentMethod || !courseId || !amount) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }

    // Create transaction
    const transaction = new Transaction({
      buyerName,
      contact,
      paymentReferenceType,
      paymentReference,
      paymentMethod,
      courseId,
      amount: parseFloat(amount),
      notes,
      issuedBy: admin?.full_name || admin?.email || 'admin',
    });

    await transaction.save();

    // Generate unique unlock code
    let code: string;
    let codeHash: string;
    let attempts = 0;
    do {
      code = generateUnlockCode();
      codeHash = hashCode(code);
      attempts++;
      if (attempts > 10) {
        res.status(500).json({ success: false, message: "Failed to generate unique code" });
        return;
      }
    } while (await UnlockCode.findOne({ codeHash }));

    // Create unlock code
    const unlockCode = new UnlockCode({
      codeHash,
      courseId,
      issuedTo: buyerName,
      issuedBy: admin?.full_name || admin?.email || 'admin',
      transactionId: transaction._id.toString(),
      expiresOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await unlockCode.save();

    // Update transaction with code ID
    transaction.unlockCodeId = unlockCode._id.toString();
    await transaction.save();

    // Log payment transaction creation
    await auditLogger.logPayment(
      transaction._id.toString(),
      'system', // Admin action
      'admin',
      'Admin',
      parseFloat(amount),
      'USD', // Assuming USD, could be made configurable
      'success',
      undefined,
      {
        buyerName,
        contact,
        paymentMethod,
        courseId,
        courseName: course.title,
        unlockCode: code,
        issuedBy: admin?.full_name || admin?.email || 'admin'
      }
    );

    res.json({
      success: true,
      data: {
        transaction,
        unlockCode: code, // Return plain code for admin
        message: `Transaction created and code generated: ${code}`
      }
    });
  } catch (error) {
    console.error("Error creating offline transaction:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all transactions
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all unlock codes
export const getUnlockCodes = async (req: Request, res: Response): Promise<void> => {
  try {
    const codes = await UnlockCode.find()
      .populate('transactionId', 'buyerName contact')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: codes });
  } catch (error) {
    console.error("Error fetching unlock codes:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Redeem unlock code (for mobile app)
export const redeemUnlockCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, courseId } = req.body;
    const userId = req.user?.id;

    if (!code || !courseId || !userId) {
      res.status(400).json({ success: false, message: "Code, course ID, and user authentication required" });
      return;
    }

    const codeHash = hashCode(code.toUpperCase().replace(/-/g, ''));

    const unlockCode = await UnlockCode.findOne({ codeHash, courseId });
    if (!unlockCode) {
      res.status(404).json({ success: false, message: "Invalid code or code doesn't match this course" });
      return;
    }

    if (unlockCode.isUsed) {
      res.status(400).json({ success: false, message: "This code has already been redeemed" });
      return;
    }

    if (unlockCode.expiresOn && unlockCode.expiresOn < new Date()) {
      res.status(400).json({ success: false, message: "This code has expired" });
      return;
    }

    // Check if user already enrolled in this course
    const existingEnrollment = await CourseEnrollment.findOne({ courseId, studentId: userId });
    if (existingEnrollment) {
      res.status(400).json({ success: false, message: "You are already enrolled in this course" });
      return;
    }

    // Mark code as used
    unlockCode.isUsed = true;
    unlockCode.usedByUserId = userId;
    unlockCode.usedTimestamp = new Date();
    await unlockCode.save();

    // Create enrollment
    const enrollment = new CourseEnrollment({
      courseId,
      studentId: userId,
      enrolledAt: new Date(),
      progress: 0,
      completedLessons: [],
      moduleProgress: {},
    });
    await enrollment.save();

    // Update course enrolled count
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });

    // Get course and user details for logging
    const course = await Course.findById(courseId);
    // Note: We don't have direct access to user details here, so we'll use generic info

    // Log code redemption and enrollment
    await auditLogger.logPayment(
      unlockCode.transactionId.toString(),
      userId,
      'student',
      'Unknown Student', // We don't have student name
      0, // Amount not available in this context
      'USD',
      'success',
      undefined,
      {
        action: 'code_redemption',
        unlockCode: code,
        courseId,
        courseName: course?.title || 'Unknown Course'
      }
    );

    res.json({
      success: true,
      message: "Code redeemed successfully. You are now enrolled in the course.",
      data: { enrollment }
    });
  } catch (error) {
    console.error("Error redeeming unlock code:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};