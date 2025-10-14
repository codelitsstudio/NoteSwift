import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Admin from '@/lib/models/Admin';
import { verifyAdmin } from '@/lib/auth/admin-auth';

export async function GET(request: NextRequest) {
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

    // Return current admin data (excluding sensitive fields)
    const adminData = {
      _id: authResult.admin._id.toString(),
      email: authResult.admin.email,
      name: authResult.admin.name,
      role: authResult.admin.role,
      isActive: authResult.admin.isActive,
      createdAt: authResult.admin.createdAt,
      lastLogin: authResult.admin.lastLogin,
      // Add any other non-sensitive fields as needed
    };

    return NextResponse.json({
      success: true,
      admin: adminData
    });

  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}