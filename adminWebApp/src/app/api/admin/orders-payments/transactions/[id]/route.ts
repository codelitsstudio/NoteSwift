import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Transaction from '@/lib/models/Transaction';
import { verifyAdmin } from '@/lib/auth/admin-auth';

// GET /api/admin/orders-payments/transactions/[id] - Get specific transaction details
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
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({
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
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}