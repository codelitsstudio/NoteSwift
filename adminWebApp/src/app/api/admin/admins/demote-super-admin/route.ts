import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Admin from '@/lib/models/Admin';
import { verifyAdmin, canDemoteFromSuperAdmin } from '@/lib/auth/admin-auth';

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

    // Only system admin can demote super admins
    if (!canDemoteFromSuperAdmin(authResult.admin.role)) {
      return NextResponse.json(
        { error: 'Only system admin can demote super admins' },
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

    // Find the admin to demote
    const adminToDemote = await Admin.findById(adminId);
    if (!adminToDemote) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Cannot demote system admin
    if (adminToDemote.role === 'system_admin') {
      return NextResponse.json(
        { error: 'Cannot demote system admin' },
        { status: 400 }
      );
    }

    // Can only demote super admins
    if (adminToDemote.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Can only demote super admins' },
        { status: 400 }
      );
    }

    // Demote super admin to regular admin
    await Admin.findByIdAndUpdate(adminId, { role: 'admin' });

    return NextResponse.json({
      success: true,
      message: 'Super admin demoted to regular admin successfully'
    });

  } catch (error) {
    console.error('Error demoting super admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}