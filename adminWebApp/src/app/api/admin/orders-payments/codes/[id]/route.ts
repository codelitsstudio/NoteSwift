import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import UnlockCode from '@/lib/models/UnlockCode';
import Transaction from '@/lib/models/Transaction';
import { verifyAdmin } from '@/lib/auth/admin-auth';

// GET /api/admin/orders-payments/codes/[id] - Get specific unlock code with transaction details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const unlockCode = await UnlockCode.findById(id);

    if (!unlockCode) {
      return NextResponse.json({ success: false, message: "Code not found" }, { status: 404 });
    }

    // Fetch transaction details in the same call
    const transaction = await Transaction.findById(unlockCode.transactionId);

    return NextResponse.json({
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
        } : null
      }
    });
  } catch (error) {
    console.error("Error fetching unlock code:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}