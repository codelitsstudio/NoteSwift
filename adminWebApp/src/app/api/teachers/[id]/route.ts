import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongoose';
import Teacher from '@/lib/models/Teacher';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const teacher = await Teacher.findById(params.id).select('-password -loginAttempts -lockUntil -emailVerificationCode -emailVerificationExpiry').lean();
    if (!teacher) {
      return new Response(JSON.stringify({ success: false, message: 'Teacher not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ success: true, data: { teacher } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('admin get teacher error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}