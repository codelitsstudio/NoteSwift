import { NextRequest } from 'next/server';
import { BaseApiHandler } from '../utils/baseHandler';
import Teacher from '@/models/Teacher';
import connectDB from '@/lib/mongoose';
import { EmailService } from '@/lib/emailService';

export class AdminController extends BaseApiHandler {
  // Simple admin validation: token payload must have role === 'admin'
  protected async validateAdmin(req: NextRequest): Promise<any> {
    const decoded = await this.validateTeacher(req);
    if (!decoded || decoded.role !== 'admin') {
      throw new Error('Admin privileges required');
    }
    return decoded;
  }

  // List pending teachers (supports ?status=pending_approval)
  async listTeachers(req: NextRequest) {
    try {
      await connectDB();
      await this.validateAdmin(req);

      const url = new URL(req.url);
      const status = url.searchParams.get('status') || 'pending_approval';

      const query: any = {};
      if (status) query.status = status;
      // Only pending approval by default
      const teachers = await Teacher.find(query).select('firstName lastName email onboardingStep onboardingComplete status approvalStatus createdAt updatedAt').sort({ createdAt: -1 }).limit(100);

      return this.success({ teachers }, 'Pending teachers retrieved');
    } catch (error: any) {
      console.error('List teachers error:', error);
      return this.handleError(error);
    }
  }

  // Approve a teacher
  async approveTeacher(req: NextRequest) {
    try {
      await connectDB();
  const admin = await this.validateAdmin(req);
      const params = this.getPathParams(req, '/api/admin/teachers/[id]/approve');
      const teacherId = params.id;

      const teacher = await Teacher.findById(teacherId);
      if (!teacher) return this.notFound('Teacher not found');

      if (teacher.approvalStatus === 'approved') {
        return this.clientError('Teacher already approved');
      }

  teacher.approvalStatus = 'approved';
  teacher.status = 'active';
  (teacher as any).approvedAt = new Date();
  (teacher as any).approvedBy = admin._id || admin.id || null;

      await teacher.save();

      // Send approval email
      try {
        await EmailService.sendApprovalEmail(teacher.email, teacher.firstName, teacher.lastName);
      } catch (e) {
        console.error('Failed to send approval email:', e);
      }

  return this.success({ id: teacher._id, approvalStatus: teacher.approvalStatus, status: teacher.status, approvedAt: (teacher as any).approvedAt }, 'Teacher approved successfully');
    } catch (error: any) {
      console.error('Approve teacher error:', error);
      return this.handleError(error);
    }
  }

  // Reject a teacher with optional reason
  async rejectTeacher(req: NextRequest) {
    try {
      await connectDB();
  const admin = await this.validateAdmin(req);
      const params = this.getPathParams(req, '/api/admin/teachers/[id]/reject');
      const teacherId = params.id;

      const body = await this.parseBody(req);
      const reason = body?.reason || 'Not specified';

      const teacher = await Teacher.findById(teacherId);
      if (!teacher) return this.notFound('Teacher not found');

      if (teacher.approvalStatus === 'rejected') {
        return this.clientError('Teacher already rejected');
      }

  teacher.approvalStatus = 'rejected';
  (teacher as any).rejectionReason = reason;
  teacher.status = 'inactive';
  (teacher as any).rejectedAt = new Date();
  (teacher as any).rejectedBy = admin._id || admin.id || null;

      await teacher.save();

      // Send rejection email
      try {
        await EmailService.sendRejectionEmail(teacher.email, teacher.firstName, teacher.lastName, reason);
      } catch (e) {
        console.error('Failed to send rejection email:', e);
      }

  return this.success({ id: teacher._id, approvalStatus: teacher.approvalStatus, status: teacher.status, rejectedAt: (teacher as any).rejectedAt, reason }, 'Teacher rejected');
    } catch (error: any) {
      console.error('Reject teacher error:', error);
      return this.handleError(error);
    }
  }
}

export const Admin = new AdminController();
