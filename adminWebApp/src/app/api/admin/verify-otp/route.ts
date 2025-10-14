import { NextRequest, NextResponse } from 'next/server';
import { generateAdminToken } from '@/lib/auth/admin-auth';
import dbConnect from '@/lib/mongoose';
import Admin from '@/lib/models/Admin';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Check if OTP exists and is valid
    const otpData = global.otpStore?.[email];
    if (!otpData) {
      return NextResponse.json(
        { error: 'No OTP found for this email' },
        { status: 400 }
      );
    }

    if (Date.now() > otpData.expires) {
      // Clean up expired OTP
      if (global.otpStore) {
        delete global.otpStore[email];
      }
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      );
    }

    if (otpData.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Get admin details
    const admin = await Admin.findById(otpData.adminId);
    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { error: 'Admin not found or inactive' },
        { status: 400 }
      );
    }

    // Clean up OTP
    if (global.otpStore) {
      delete global.otpStore[email];
    }

    // Generate JWT token
    const token = generateAdminToken(admin._id.toString(), admin.role);
    console.log('Generated token for admin:', admin.email, 'role:', admin.role);

    // Update last login
    await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

    // Return token and admin info
    const adminResponse = {
      _id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
      lastLogin: admin.lastLogin ? admin.lastLogin.toISOString() : null
    };

    return NextResponse.json({
      success: true,
      token,
      admin: adminResponse,
      message: 'OTP verification successful'
    });

  } catch (error) {
    console.error('Error during OTP verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}