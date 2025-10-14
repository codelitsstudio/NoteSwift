import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Admin from '@/lib/models/Admin';
import { verifyAdmin, canDeleteAdmin, canManageSpecificAdmin } from '@/lib/auth/admin-auth';

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

    const { adminId } = await request.json();

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    // Find the admin to remove
    const adminToRemove = await Admin.findById(adminId);
    if (!adminToRemove) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Check if current admin can delete the target admin
    if (!canDeleteAdmin(authResult.admin.role, adminToRemove.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this admin' },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (!canManageSpecificAdmin(authResult.admin, adminId, adminToRemove.role)) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 403 }
      );
    }

    // Cannot remove system admin
    if (adminToRemove.role === 'system_admin') {
      return NextResponse.json(
        { error: 'Cannot remove system admin' },
        { status: 400 }
      );
    }

    // Soft delete by deactivating
    await Admin.findByIdAndUpdate(adminId, { isActive: false });

    return NextResponse.json({
      success: true,
      message: 'Admin removed successfully'
    });

  } catch (error) {
    console.error('Error removing admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}