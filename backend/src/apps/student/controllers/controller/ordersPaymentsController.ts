import { Request, Response, NextFunction } from "express";
import Transaction from "../../models/Transaction.model";
import UnlockCode from "../../models/UnlockCode.model";
import Course from "../../models/Course.model";
import CourseEnrollment from "../../models/CourseEnrollment";
import { Types } from "mongoose";
import crypto from 'crypto';
import auditLogger from "../../lib/audit-logger";

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
export const createOfflineTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
export const getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all unlock codes
export const getUnlockCodes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
export const redeemUnlockCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, courseId } = req.body;
    const student = res.locals.student;

    console.log('🎫 REDEEM CODE REQUEST:', {
      code: code ? 'provided' : 'missing',
      courseId: courseId ? 'provided' : 'missing',
      studentId: student ? student._id : 'missing'
    });

    if (!code || !courseId || !student) {
      console.log('❌ Missing required fields for redeem code');
      res.status(400).json({ success: false, message: "Code, course ID, and user authentication required" });
      return;
    }

    const userId = student._id; // Keep as ObjectId

    const courseIdObj = Types.ObjectId.isValid(courseId) ? new Types.ObjectId(courseId) : courseId;

    const codeHash = hashCode(code.toUpperCase().replace(/-/g, ''));
    console.log('🔍 Looking for unlock code with hash:', codeHash.substring(0, 10) + '...', 'for course:', courseId);
    console.log('🔍 Code format check - original:', code, 'normalized:', code.toUpperCase().replace(/-/g, ''));

    let unlockCode = await UnlockCode.findOne({ codeHash, courseId: courseIdObj });
    
    // If not found by hash, try to find by plain code if it exists
    let foundByPlainCode = false;
    if (!unlockCode) {
      console.log('🔍 Code not found by hash, trying plain code lookup...');
      const plainCodeLookup = await UnlockCode.findOne({ 
        $or: [
          { code: code.toUpperCase().replace(/-/g, '') },
          { code: code.toUpperCase() }
        ],
        courseId: courseIdObj
      });
      if (plainCodeLookup) {
        console.log('✅ Found code by plain text lookup');
        unlockCode = plainCodeLookup;
        foundByPlainCode = true;
      }
    }
    if (!unlockCode) {
      console.log('❌ Unlock code not found in database');
      // Debug: Show all codes for this course
      const allCodesForCourse = await UnlockCode.find({ courseId: courseIdObj });
      console.log('🔍 Debug: Found', allCodesForCourse.length, 'total codes for course', courseId);
      allCodesForCourse.forEach((c, i) => {
        console.log(`  ${i+1}. Hash: ${c.codeHash.substring(0, 16)}... Plain code: ${(c as any).code || 'N/A'} Used: ${c.isUsed}`);
      });
      res.status(404).json({ success: false, message: "Invalid code or code doesn't match this course" });
      return;
    }

    console.log('✅ Found unlock code:', {
      id: unlockCode._id,
      foundBy: foundByPlainCode ? 'plain_code' : 'hash',
      isUsed: unlockCode.isUsed,
      expiresOn: unlockCode.expiresOn,
      courseId: unlockCode.courseId
    });

    if (unlockCode.isUsed) {
      console.log('❌ Code already used');
      res.status(400).json({ success: false, message: "This code has already been redeemed" });
      return;
    }

    if (unlockCode.expiresOn && unlockCode.expiresOn < new Date()) {
      console.log('❌ Code expired:', unlockCode.expiresOn);
      res.status(400).json({ success: false, message: "This code has expired" });
      return;
    }

    // Check if user already enrolled in this course
    const existingEnrollment = await CourseEnrollment.findOne({ courseId: courseIdObj, studentId: userId });
    if (existingEnrollment) {
      console.log('❌ User already enrolled in course');
      res.status(400).json({ success: false, message: "You are already enrolled in this course" });
      return;
    }

    // Mark code as used
    unlockCode.isUsed = true;
    unlockCode.usedByUserId = userId.toString();
    unlockCode.usedTimestamp = new Date();
    await unlockCode.save();
    console.log('✅ Code marked as used');

    // Create enrollment
    console.log('🔄 Attempting to create enrollment with data:', {
      courseId,
      studentId: userId,
      enrolledAt: new Date(),
      progress: 0
    });
    
    const enrollment = new CourseEnrollment({
      courseId: Types.ObjectId.isValid(courseId) ? new Types.ObjectId(courseId) : courseId,
      studentId: userId,
      enrolledAt: new Date(),
      progress: 0,
      completedLessons: [],
      moduleProgress: [],
    });
    
    try {
      await enrollment.save();
      console.log('✅ Enrollment created successfully:', enrollment._id);
    } catch (enrollmentError) {
      console.error('❌ Failed to save enrollment:', enrollmentError);
      // Don't return here, continue with the rest but mark that enrollment failed
      res.status(500).json({ success: false, message: "Code redeemed but enrollment creation failed" });
      return;
    }

    // Update course enrolled count
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
    console.log('✅ Course enrolled count updated');

    // Get course and user details for logging
    const course = await Course.findById(courseId);
    console.log('✅ Course found for logging:', course?.title || 'Unknown');

    // Log code redemption and enrollment
    await auditLogger.logPayment(
      unlockCode.transactionId.toString(),
      userId.toString(),
      'student',
      student.full_name || 'Unknown Student',
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

    console.log('✅ Code redemption logged successfully');

    res.json({
      success: true,
      message: "Code redeemed successfully. You are now enrolled in the course.",
      data: { enrollment }
    });
  } catch (error) {
    console.error("❌ Error redeeming unlock code:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};