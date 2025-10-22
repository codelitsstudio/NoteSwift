import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Resend } from 'resend';
import Admin from '../models/Admin';
import { createAuditLogFromRequest } from '../utils/auditLogger';
import {
  canInviteAdmins,
  canDeleteAdmin,
  canManageSpecificAdmin,
  canSetSuperAdmin,
  canDemoteFromSuperAdmin
} from '../lib/auth/admin-auth';

// Lazy initialize Resend to ensure env vars are loaded
const getResend = () => new Resend(process.env.RESEND_API_KEY);

// GET /api/admin/admins - Get all admins
export const listAdmins = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('👥 Fetching admins list...');
    // Only fetch active admins
    const admins = await Admin.find({ isActive: true })
      .select('-password -invitationToken')
      .sort({ createdAt: -1 });

    console.log(`  - Found ${admins.length} active admins`);

    const serializedAdmins = admins.map(admin => ({
      _id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
      createdAt: admin.createdAt,
      lastLogin: admin.lastLogin,
      isActive: admin.isActive,
    }));

    res.json({
      success: true,
      admins: serializedAdmins
    });
  } catch (error) {
    console.error('❌ Error fetching admins:', error);
    res.status(500).json({ error: 'Internal server error' });
      return;
  }
};

// POST /api/admin/admins/invite - Invite a new admin
export const inviteAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = (req as any).admin;

    // Check if admin can invite others
    if (!canInviteAdmins(admin.role)) {
      res.status(403).json({ error: 'Insufficient permissions to invite admins' });
      return;
    }

    const { email, message } = req.body;

    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      res.status(400).json({ error: 'Admin with this email already exists' });
      return;
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation record
    await Admin.create({
      email: email.toLowerCase(),
      name: 'Pending Registration',
      role: 'admin',
      isActive: false,
      invitedBy: admin._id,
      invitationToken,
      invitationExpires
    });

    // Send invitation email
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/signup?token=${invitationToken}`;

    try {
      const resend = getResend();
      await resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: email,
        subject: 'You\'ve been invited to join NoteSwift as an Administrator',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to NoteSwift!</h2>
            <p>You have been invited to join the NoteSwift platform as an administrator.</p>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;">${message || 'You have been invited to join as an administrator.'}</p>
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
      // Continue even if email fails
    }

    res.json({
      success: true,
      message: 'Admin invitation sent successfully'
    });
  } catch (error) {
    console.error('Error inviting admin:', error);
    res.status(500).json({ error: 'Internal server error' });
      return;
  }
};

// POST /api/admin/admins/remove - Remove an admin
export const removeAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = (req as any).admin;
    const { adminId, reason } = req.body;

    if (!adminId) {
      res.status(400).json({ error: 'Admin ID is required' });
      return;
    }

    if (!reason || !reason.trim()) {
      res.status(400).json({ error: 'Reason for removal is required' });
      return;
    }

    // Find the admin to remove
    const adminToRemove = await Admin.findById(adminId);
    if (!adminToRemove) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }

    // Check if current admin can delete the target admin
    if (!canDeleteAdmin(admin.role, adminToRemove.role)) {
      res.status(403).json({ error: 'Insufficient permissions to delete this admin' });
      return;
    }

    // Prevent self-deletion
    if (!canManageSpecificAdmin(admin, adminId, adminToRemove.role)) {
      res.status(403).json({ error: 'Cannot delete yourself' });
      return;
    }

    // Cannot remove system admin
    if (adminToRemove.role === 'system_admin') {
      res.status(400).json({ error: 'Cannot remove system admin' });
      return;
    }

    // Soft delete by deactivating
    await Admin.findByIdAndUpdate(adminId, { 
      isActive: false,
      removalReason: reason.trim(),
      removedAt: new Date(),
      removedBy: admin._id
    });

    // Create audit log
    await createAuditLogFromRequest(req, {
      userId: admin._id,
      userType: 'admin',
      userName: admin.name,
      userEmail: admin.email,
      action: 'admin_removed',
      category: 'user_management',
      resourceType: 'admin',
      resourceId: adminId,
      resourceName: adminToRemove.name,
      details: `Admin "${admin.name}" removed administrator "${adminToRemove.name}" (${adminToRemove.email}). Reason: ${reason.trim()}`,
      status: 'warning',
      metadata: {
        additionalData: {
          removedAdminRole: adminToRemove.role,
          removalReason: reason.trim()
        }
      }
    });

    // Send email notification
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: adminToRemove.email,
        subject: 'Admin Access Removed - NoteSwift',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Admin Access Removed</h2>
            <p>Dear ${adminToRemove.name},</p>
            <p>Your administrator access to NoteSwift has been removed.</p>
            
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>Reason:</strong>
              <p style="margin: 10px 0 0 0;">${reason.trim()}</p>
            </div>
            
            <p>You will no longer be able to access the admin dashboard. If you believe this is a mistake, please contact the system administrator.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              <p>Removed by: ${admin.name} (${admin.email})</p>
              <p>Date: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `,
      });
      console.log(`Removal notification email sent to ${adminToRemove.email}`);
    } catch (emailError) {
      console.error('Failed to send removal notification email:', emailError);
      // Continue even if email fails
    }

    res.json({
      success: true,
      message: 'Admin removed successfully and notified via email'
    });
  } catch (error) {
    console.error('Error removing admin:', error);
    res.status(500).json({ error: 'Internal server error' });
      return;
  }
};

// POST /api/admin/admins/set-super-admin - Set a super admin
export const setSuperAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = (req as any).admin;

    // Only system admin can set super admin
    if (!canSetSuperAdmin(admin.role)) {
      res.status(403).json({ error: 'Only system admin can set super admin' });
      return;
    }

    const { adminId } = req.body;

    if (!adminId) {
      res.status(400).json({ error: 'Admin ID is required' });
      return;
    }

    // Find the admin to promote
    const adminToPromote = await Admin.findById(adminId);
    if (!adminToPromote) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }

    if (adminToPromote.role === 'system_admin') {
      res.status(400).json({ error: 'Cannot modify system admin role' });
      return;
    }

    // Remove current super admin role if exists
    await Admin.updateMany(
      { role: 'super_admin' },
      { role: 'admin' }
    );

    // Set new super admin
    await Admin.findByIdAndUpdate(adminId, { role: 'super_admin' });

    res.json({
      success: true,
      message: 'Super admin updated successfully'
    });
  } catch (error) {
    console.error('Error setting super admin:', error);
    res.status(500).json({ error: 'Internal server error' });
      return;
  }
};

// POST /api/admin/admins/demote-super-admin - Demote a super admin
export const demoteSuperAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = (req as any).admin;

    // Only system admin can demote super admins
    if (!canDemoteFromSuperAdmin(admin.role)) {
      res.status(403).json({ error: 'Only system admin can demote super admins' });
      return;
    }

    const { adminId } = req.body;

    if (!adminId) {
      res.status(400).json({ error: 'Admin ID is required' });
      return;
    }

    // Find the admin to demote
    const adminToDemote = await Admin.findById(adminId);
    if (!adminToDemote) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }

    // Cannot demote system admin
    if (adminToDemote.role === 'system_admin') {
      res.status(400).json({ error: 'Cannot demote system admin' });
      return;
    }

    // Can only demote super admins
    if (adminToDemote.role !== 'super_admin') {
      res.status(400).json({ error: 'Can only demote super admins' });
      return;
    }

    // Demote super admin to regular admin
    await Admin.findByIdAndUpdate(adminId, { role: 'admin' });

    res.json({
      success: true,
      message: 'Super admin demoted to regular admin successfully'
    });
  } catch (error) {
    console.error('Error demoting super admin:', error);
    res.status(500).json({ error: 'Internal server error' });
      return;
  }
};
