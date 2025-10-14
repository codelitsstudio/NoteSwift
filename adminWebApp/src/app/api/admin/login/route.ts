import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, generateAdminToken } from '@/lib/auth/admin-auth';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Extend global object for OTP storage
declare global {
  var otpStore: Record<string, { otp: string; expires: number; adminId: string }> | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate admin
    const authResult = await authenticateAdmin(email, password);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    // Only allow system admin to login through this endpoint
    if (authResult.admin.role !== 'system_admin') {
      return NextResponse.json(
        { error: 'This login portal is only for system administrators. Regular admins should use the main login page.' },
        { status: 403 }
      );
    }

    // System admin login - require OTP verification
    console.log('System admin login detected:', authResult.admin.email, 'Role:', authResult.admin.role);
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP temporarily (in a real app, use Redis or database)
    // For now, we'll store in a simple in-memory store
    global.otpStore = global.otpStore || {};
    global.otpStore[email] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      adminId: authResult.admin._id.toString()
    };

    // Send OTP email
    try {
      await resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: email,
        subject: 'System Admin Login Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">System Admin Login Verification</h2>
            <p>Your 6-digit verification code is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      });

      return NextResponse.json({
        success: true,
        requiresOtp: true,
        message: 'A 6-digit code was sent to the email address of system admin.'
      });

    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification code' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}