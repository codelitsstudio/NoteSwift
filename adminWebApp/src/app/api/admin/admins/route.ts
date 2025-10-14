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

    // All authenticated admins can view the admin list
    // Permission checks for specific actions are handled in the UI

    const admins = await Admin.find({})
      .select('-password -invitationToken')
      .sort({ createdAt: -1 });

    // Convert MongoDB documents to plain objects
    const serializedAdmins = admins.map(admin => ({
      _id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
      createdAt: admin.createdAt,
      lastLogin: admin.lastLogin,
      isActive: admin.isActive,
    }));

    return NextResponse.json({
      success: true,
      admins: serializedAdmins
    });

  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}