import { Request, Response } from 'express';
import { Resend } from 'resend';
import AppUpdate from '../../../core/models/admin/AppUpdate';

// Initialize Resend for email sending
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error('❌ RESEND_API_KEY environment variable is not set!');
  console.error('Please check your .env file and ensure RESEND_API_KEY is defined.');
  process.exit(1);
}
const resend = new Resend(resendApiKey);

// Generate and send verification code
const sendVerificationCode = async (title: string, subtitle: string, adminEmail: string): Promise<string> => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Create or update draft app update with verification code
  await AppUpdate.findOneAndUpdate(
    {}, // Find any document (assuming single state)
    {
      title: title.trim(),
      subtitle: subtitle.trim(),
      verificationCode: code,
      isActive: false,
      createdBy: adminEmail,
      createdAt: new Date()
    },
    { upsert: true, new: true }
  );

  try {
    const { data, error } = await resend.emails.send({
      from: 'NoteSwift <noteswift@codelitsstudio.com>',
      to: ['info@codelitsstudio.com'], // System admin email
      subject: 'NoteSwift App Blocking Verification Code',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">

            <div style="padding: 40px 40px 20px; text-align: center;">
              <img src="https://i.postimg.cc/Gh6L7sKL/IMG-4146.png" alt="NoteSwift Logo" style="width: 150px; height: auto; margin-bottom: 20px;" onerror="this.onerror=null;this.src='https://placehold.co/150x50/007AFF/ffffff?text=NoteSwift&font=raleway';">
            </div>

            <div style="padding: 0 40px 30px;">
              <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 22px; text-align: center;">App Blocking Verification Required</h2>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                A request has been made to trigger a forced app block for all NoteSwift users.
              </p>

              <div style="background-color: #e6f2ff; border: 2px dashed #99cfff; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
                <p style="margin:0; color: #374151; font-size: 14px; margin-bottom: 10px;">Your verification code is:</p>
                <span style="font-size: 36px; font-weight: bold; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace;">${code}</span>
              </div>

              <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin-bottom: 25px;">
                <p style="margin:0; color: #0c4a6e; font-size: 14px; line-height: 1.5;">
                  <strong>Requested by:</strong> ${adminEmail}<br>
                  <strong>Time:</strong> ${new Date().toLocaleString()}<br>
                  <strong>Expires:</strong> 10 minutes from now
                </p>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; text-align: center;">
                If you did not request this action, please contact the admin team immediately.
              </p>
            </div>

            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} NoteSwift. All rights reserved.<br>
                This is an automated security message.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }

    console.log(`✅ Verification code sent to system admin: ${code}`);
    return code;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Create app update (send verification)
export const createAppUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, subtitle, verificationCode } = req.body;
    const admin = (req as any).admin;

    // Only system admin can trigger app updates
    if (admin.role !== 'system_admin') {
      res.status(403).json({
        success: false,
        message: 'Only System Admin can trigger app updates',
      });
      return;
    }

    // Validate input
    if (!title?.trim() || !subtitle?.trim()) {
      res.status(400).json({
        success: false,
        message: 'Title and subtitle are required',
      });
      return;
    }

    // If no verification code provided, send one
    if (!verificationCode) {
      await sendVerificationCode(title, subtitle, admin.email);

      res.json({
        success: true,
        message: 'Verification code sent to system admin email',
        requiresVerification: true,
      });
      return;
    }

    // Verify the code
    const currentUpdate = await AppUpdate.findOne({});
    if (!currentUpdate || verificationCode !== currentUpdate.verificationCode) {
      res.status(400).json({
        success: false,
        message: 'Invalid verification code',
      });
      return;
    }

    // Activate the app update
    await AppUpdate.findOneAndUpdate(
      {},
      {
        isActive: true,
        verificationCode: null, // Clear the code
      },
      { upsert: true, new: true }
    );

    // Log the action
    console.log(`🚨 APP UPDATE ACTIVATED by ${admin.email}: ${title}`);

    res.json({
      success: true,
      message: 'App update activated successfully',
      data: {
        title: title.trim(),
        subtitle: subtitle.trim(),
        createdAt: currentUpdate.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Create app update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create app update',
    });
  }
};

// Deactivate app update
export const deactivateAppUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = (req as any).admin;

    // Only system admin can deactivate app updates
    if (admin.role !== 'system_admin') {
      res.status(403).json({
        success: false,
        message: 'Only System Admin can deactivate app updates',
      });
      return;
    }

    const currentUpdate = await AppUpdate.findOne({ isActive: true });
    if (!currentUpdate) {
      res.status(400).json({
        success: false,
        message: 'No active app update to deactivate',
      });
      return;
    }

    // Deactivate the update
    await AppUpdate.findOneAndUpdate(
      { _id: currentUpdate._id },
      { isActive: false, verificationCode: null }
    );

    console.log(`✅ APP UPDATE DEACTIVATED by ${admin.email}`);

    res.json({
      success: true,
      message: 'App update deactivated successfully',
    });
  } catch (error: any) {
    console.error('Deactivate app update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to deactivate app update',
    });
  }
};

// Get app update status (for mobile app)
export const getAppUpdateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUpdate = await AppUpdate.findOne({ isActive: true });

    res.json({
      success: true,
      data: {
        isActive: currentUpdate ? currentUpdate.isActive : false,
        title: currentUpdate ? currentUpdate.title : '',
        subtitle: currentUpdate ? currentUpdate.subtitle : '',
      },
    });
  } catch (error: any) {
    console.error('Get app update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get app update status',
    });
  }
};

// Get app update status for admin panel
export const getAppUpdateForAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = (req as any).admin;

    // Only system admin can view update details
    if (admin.role !== 'system_admin') {
      res.status(403).json({
        success: false,
        message: 'Only System Admin can view app update details',
      });
      return;
    }

    const currentUpdate = await AppUpdate.findOne({});

    res.json({
      success: true,
      data: currentUpdate ? {
        ...currentUpdate.toObject(),
        verificationCode: undefined, // Don't send the code back
      } : {
        isActive: false,
        title: '',
        subtitle: '',
        verificationCode: null,
        createdAt: null,
        createdBy: '',
      },
    });
  } catch (error: any) {
    console.error('Get app update for admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get app update details',
    });
  }
};