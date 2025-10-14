import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import dbConnect from '@/lib/mongoose';
import Admin from '@/lib/models/Admin';
import { verifyAdmin, canInviteAdmins } from '@/lib/auth/admin-auth';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if admin can invite others
    if (!canInviteAdmins(authResult.admin.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to invite admins' },
        { status: 403 }
      );
    }

    const { email, message } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
        { status: 400 }
      );
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation record
    const invitation = await Admin.create({
      email: email.toLowerCase(),
      name: 'Pending Registration', // Will be updated during signup
      role: 'admin',
      isActive: false,
      invitedBy: authResult.admin._id,
      invitationToken,
      invitationExpires
    });

    // Send invitation email
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/signup?token=${invitationToken}`;

    try {
      await resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: email,
        subject: 'You\'ve been invited to join NoteSwift as an Administrator',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to NoteSwift!</h2>
            <p>You have been invited to join the NoteSwift platform as an administrator.</p>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;">${message}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationUrl}"
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Accept Invitation
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              NoteSwift - Educational Platform<br>
              If you have any questions, please contact support.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      // Delete the invitation record if email fails
      await Admin.findByIdAndDelete(invitation._id);
      return NextResponse.json(
        { error: 'Failed to send invitation email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully'
    });

  } catch (error) {
    console.error('Error sending admin invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}