import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import UnlockCode from '@/lib/models/UnlockCode';
import Transaction from '@/lib/models/Transaction';
import { verifyAdmin } from '@/lib/auth/admin-auth';

// GET /api/admin/orders-payments/codes - Get all unlock codes with pagination
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50'))); // Max 100 items per page
    const skip = (page - 1) * limit;

    const codes = await UnlockCode.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await UnlockCode.countDocuments();

    console.log(`Fetching ${limit} codes for page ${page}, total codes: ${total}, transactionIds found: ${codes.filter(c => c.transactionId).length}`);

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
        // Continue without transaction data if there's an error
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
          ...code.toObject(),
          transaction: code.transactionId && transactionMap[code.transactionId.toString()]
            ? transactionMap[code.transactionId.toString()]
            : null
        };
      } catch (error) {
        console.error(`Error processing code ${code._id}:`, error);
        return {
          ...code.toObject(),
          transaction: null
        };
      }
    });

    return NextResponse.json({
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
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}