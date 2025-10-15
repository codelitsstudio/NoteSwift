import { Request, Response } from 'express';
import crypto from 'crypto';
import Transaction from '../models/Transaction';
import UnlockCode from '../models/UnlockCode';
import Course from '../models/Course';
import { createAuditLogFromRequest } from '../utils/auditLogger';

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

// GET /api/admin/orders-payments/transactions - Get all transactions with pagination
export const listTransactions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments();

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/admin/orders-payments/codes - Get all unlock codes with pagination
export const listUnlockCodes = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const codes = await UnlockCode.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await UnlockCode.countDocuments();

    console.log(`Fetching ${limit} codes for page ${page}, total codes: ${total}`);

    // Fetch transaction data for all codes in this batch
    const transactionIds = codes
      .map(code => code.transactionId)
      .filter((id): id is string => id !== null && id !== undefined && id.trim() !== '');

    let transactions: any[] = [];
    if (transactionIds.length > 0) {
      try {
        transactions = await Transaction.find({ _id: { $in: transactionIds } });
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    }

    // Create a map of transactionId to transaction data
    const transactionMap: Record<string, any> = {};
    transactions.forEach(transaction => {
      if (transaction && transaction._id) {
        transactionMap[transaction._id.toString()] = {
          _id: transaction._id,
          buyerName: transaction.buyerName,
          contact: transaction.contact,
          paymentReferenceType: transaction.paymentReferenceType,
          paymentReference: transaction.paymentReference,
          paymentMethod: transaction.paymentMethod,
          courseId: transaction.courseId,
          amount: transaction.amount,
          notes: transaction.notes,
          status: transaction.status,
          issuedByAdminId: transaction.issuedByAdminId,
          issuedByRole: transaction.issuedByRole,
          unlockCodeId: transaction.unlockCodeId,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        };
      }
    });

    // Attach transaction data to codes
    const codesWithTransactions = codes.map(code => {
      try {
        return {
          ...(code as any).toObject(),
          transaction: code.transactionId && transactionMap[code.transactionId.toString()]
            ? transactionMap[code.transactionId.toString()]
            : null
        };
      } catch (error) {
        console.error(`Error processing code ${code._id}:`, error);
        return {
          ...(code as any).toObject(),
          transaction: null
        };
      }
    });

    res.json({
      success: true,
      data: codesWithTransactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching unlock codes:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/admin/orders-payments/transactions/:id - Get specific transaction details
export const getTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.json({
      success: true,
      data: {
        _id: transaction._id,
        buyerName: transaction.buyerName,
        contact: transaction.contact,
        paymentReferenceType: transaction.paymentReferenceType,
        paymentReference: transaction.paymentReference,
        paymentMethod: transaction.paymentMethod,
        courseId: transaction.courseId,
        amount: transaction.amount,
        notes: transaction.notes,
        status: transaction.status,
        issuedByAdminId: transaction.issuedByAdminId,
        issuedByRole: transaction.issuedByRole,
        unlockCodeId: transaction.unlockCodeId,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      }
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/admin/orders-payments/codes/:id - Get specific unlock code with transaction details
export const getUnlockCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const unlockCode = await UnlockCode.findById(id);

    if (!unlockCode) {
      return res.status(404).json({ success: false, message: "Code not found" });
    }

    // Fetch transaction details
    const transaction = await Transaction.findById(unlockCode.transactionId);

    res.json({
      success: true,
      data: {
        _id: unlockCode._id,
        code: unlockCode.code,
        codeHash: unlockCode.codeHash,
        courseId: unlockCode.courseId,
        issuedTo: unlockCode.issuedTo,
        issuedByAdminId: unlockCode.issuedByAdminId,
        issuedByRole: unlockCode.issuedByRole,
        isUsed: unlockCode.isUsed,
        usedByUserId: unlockCode.usedByUserId,
        usedDeviceHash: unlockCode.usedDeviceHash,
        usedTimestamp: unlockCode.usedTimestamp,
        expiresOn: unlockCode.expiresOn,
        createdAt: unlockCode.createdAt,
        transactionId: unlockCode.transactionId,
        transaction: transaction ? {
          _id: transaction._id,
          buyerName: transaction.buyerName,
          contact: transaction.contact,
          paymentMethod: transaction.paymentMethod,
          amount: transaction.amount,
          status: transaction.status,
          createdAt: transaction.createdAt
        } : null
      }
    });
  } catch (error) {
    console.error("Error fetching unlock code:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/admin/orders-payments/transaction - Create offline transaction and generate unlock code
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;
    const { buyerName, contact, paymentReferenceType, paymentReference, paymentMethod, courseId, amount, notes } = req.body;

    if (!buyerName || !contact || !paymentMethod || !courseId || !amount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
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
      issuedByAdminId: admin._id,
      issuedByRole: admin.role,
      status: 'completed'
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
        return res.status(500).json({ success: false, message: "Failed to generate unique code" });
      }
    } while (await UnlockCode.findOne({ codeHash }));

    // Create unlock code
    const unlockCode = new UnlockCode({
      code,
      codeHash,
      courseId,
      issuedTo: buyerName,
      issuedByAdminId: admin._id,
      issuedByRole: admin.role,
      transactionId: transaction._id.toString(),
      expiresOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await unlockCode.save();

    // Update transaction with code ID
    transaction.unlockCodeId = unlockCode._id.toString();
    await transaction.save();

    // Create audit log
    await createAuditLogFromRequest(req, {
      userId: admin._id,
      userType: 'admin',
      userName: admin.name || 'Admin',
      userEmail: admin.email,
      action: 'offline_sale_created',
      category: 'payment',
      resourceType: 'transaction',
      resourceId: (transaction._id as any).toString(),
      resourceName: `Transaction for ${buyerName}`,
      details: `Admin created offline sale for course "${course.title}" - Amount: Rs.${amount}, Method: ${paymentMethod}, Buyer: ${buyerName}`,
      status: 'success',
      metadata: {
        additionalData: {
          courseId,
          courseName: course.title,
          amount,
          paymentMethod,
          buyerName,
          contact,
          unlockCode: code
        }
      }
    });

    res.json({
      success: true,
      message: "Transaction created and unlock code generated",
      data: {
        transaction,
        unlockCode: {
          _id: unlockCode._id,
          code: unlockCode.code,
          courseId: unlockCode.courseId,
          expiresOn: unlockCode.expiresOn
        }
      }
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
