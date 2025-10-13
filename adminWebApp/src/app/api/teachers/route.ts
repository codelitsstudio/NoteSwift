import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongoose';
import Teacher from '@/lib/models/Teacher';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'pending_approval';

    let query = {};
    if (status === 'pending_approval') {
      query = { approvalStatus: { $exists: false } }; // Teachers who haven't been approved/rejected yet
    } else if (status === 'approved') {
      query = { approvalStatus: 'approved' };
    } else if (status === 'rejected') {
      query = { approvalStatus: 'rejected' };
    } else if (status === 'removed') {
      query = { approvalStatus: 'removed' };
    } else if (status === 'banned') {
      query = { approvalStatus: 'banned' };
    } else {
      query = { approvalStatus: status };
    }

    const teachers = await Teacher.find(query).select('-password -loginAttempts -lockUntil -emailVerificationCode -emailVerificationExpiry').limit(200).lean();
    return new Response(JSON.stringify({ success: true, data: { teachers } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('admin list teachers error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
