import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongoose';
import Teacher from '@/lib/models/Teacher';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const id = parts[parts.indexOf('teachers') + 1];

    const teacher = await Teacher.findById(id);
    if (!teacher) return new Response(JSON.stringify({ success: false, message: 'Teacher not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

    teacher.approvalStatus = 'approved';
    teacher.status = 'active';
    await teacher.save();

    // send email
    try {
      await resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: [teacher.email],
        subject: 'Your account approved',
        html: `<p>Hi ${teacher.firstName || ''}, your account has been approved.</p>`
      });
    } catch (e) { console.error('email send error', e); }

    return new Response(JSON.stringify({ success: true, data: { id: teacher._id, approvalStatus: teacher.approvalStatus } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err:any) {
    console.error('approve error', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
