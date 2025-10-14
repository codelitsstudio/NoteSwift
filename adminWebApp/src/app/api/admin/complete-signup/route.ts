import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Admin from '@/lib/models/Admin';
import { hashPassword } from '@/lib/auth/admin-auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { token, name, password } = await request.json();

    if (!token || !name || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Find admin with matching invitation token
    const admin = await Admin.findOne({
      invitationToken: token,
      invitationExpires: { $gt: new Date() },
      isActive: false
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation token' },
        { status: 400 }
      );
    }

    // Hash password and complete signup
    const hashedPassword = await hashPassword(password);

    await Admin.findByIdAndUpdate(admin._id, {
      name: name.trim(),
      password: hashedPassword,
      isActive: true,
      invitationToken: undefined,
      invitationExpires: undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully'
    });

  } catch (error) {
    console.error('Error completing signup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}