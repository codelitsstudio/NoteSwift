import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Transaction from '@/lib/models/Transaction';
import UnlockCode from '@/lib/models/UnlockCode';
import Course from '@/lib/models/Course';
import { verifyAdmin } from '@/lib/auth/admin-auth';
import crypto from 'crypto';

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

// POST /api/admin/orders-payments/transaction - Create offline transaction and generate unlock code
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Verify admin authentication
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { buyerName, contact, paymentReferenceType, paymentReference, paymentMethod, courseId, amount, notes } = body;

    if (!buyerName || !contact || !paymentMethod || !courseId || !amount) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
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
      issuedByAdminId: authResult.admin._id,
      issuedByRole: authResult.admin.role,
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
        return NextResponse.json({ success: false, message: "Failed to generate unique code" }, { status: 500 });
      }
    } while (await UnlockCode.findOne({ codeHash }));

    // Create unlock code
    const unlockCode = new UnlockCode({
      code, // Store plain code for admin visibility
      codeHash,
      courseId,
      issuedTo: buyerName,
      issuedByAdminId: authResult.admin._id,
      issuedByRole: authResult.admin.role,
      transactionId: transaction._id.toString(),
      expiresOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await unlockCode.save();

    // Update transaction with code ID
    transaction.unlockCodeId = unlockCode._id.toString();
    await transaction.save();

    return NextResponse.json({
      success: true,
      data: {
        transaction,
        unlockCode: code, // Return plain code for admin
        message: `Transaction created and code generated: ${code}`
      }
    });
  } catch (error) {
    console.error("Error creating offline transaction:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}