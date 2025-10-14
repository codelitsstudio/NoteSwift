import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Admin from '@/lib/models/Admin';
import { verifyAdmin, canSetSuperAdmin } from '@/lib/auth/admin-auth';

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

    // Only system admin can set super admin
    if (!canSetSuperAdmin(authResult.admin.role)) {
      return NextResponse.json(
        { error: 'Only system admin can set super admin' },
        { status: 403 }
      );
    }

    const { adminId } = await request.json();

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    // Find the admin to promote
    const adminToPromote = await Admin.findById(adminId);
    if (!adminToPromote) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    if (adminToPromote.role === 'system_admin') {
      return NextResponse.json(
        { error: 'Cannot modify system admin role' },
        { status: 400 }
      );
    }

    // Remove current super admin role if exists
    await Admin.updateMany(
      { role: 'super_admin' },
      { role: 'admin' }
    );

    // Set new super admin
    await Admin.findByIdAndUpdate(adminId, { role: 'super_admin' });

    return NextResponse.json({
      success: true,
      message: 'Super admin updated successfully'
    });

  } catch (error) {
    console.error('Error setting super admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}