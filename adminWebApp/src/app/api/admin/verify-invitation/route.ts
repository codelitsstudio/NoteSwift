import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Admin from '@/lib/models/Admin';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
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

    return NextResponse.json({
      success: true,
      email: admin.email,
      message: 'Invitation is valid'
    });

  } catch (error) {
    console.error('Error verifying invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}