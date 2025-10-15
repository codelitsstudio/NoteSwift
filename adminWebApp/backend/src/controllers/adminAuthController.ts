import { Request, Response } from 'express';
import connectDB from '../lib/mongoose';
import Admin from '../models/Admin';
import { hashPassword, generateAdminToken } from '../lib/auth/admin-auth';
import { Resend } from 'resend';
import crypto from 'crypto';
import { createAuditLogFromRequest } from '../utils/auditLogger';

// Lazy initialize Resend to ensure env vars are loaded
const getResend = () => new Resend(process.env.RESEND_API_KEY);

// OTP storage (use Redis in production)
declare global {
  var otpStore: Record<string, { otp: string; expires: number; adminId: string }> | undefined;
}

/**
 * POST /api/admin/admin-auth/login
 * Admin login - sends OTP to system admin
 */
export const login = async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Authenticate admin using the imported function
    const { authenticateAdmin } = await import('../lib/auth/admin-auth');
    const authResult = await authenticateAdmin(email, password);

    if (!authResult.success) {
      // Log failed login attempt
      await createAuditLogFromRequest(req, {
        userType: 'admin',
        userName: email,
        userEmail: email,
        action: 'admin_login_failed',
        category: 'authentication',
        details: `Failed login attempt for email: ${email}. Reason: ${authResult.error}`,
        status: 'failure'
      });
      return res.status(401).json({ error: authResult.error || 'Authentication failed' });
    }

    // Only allow system admin for this endpoint
    if (authResult.admin.role !== 'system_admin') {
      return res.status(403).json({ 
        error: 'This login portal is only for system administrators. Regular admins should use /login' 
      });
    }

    console.log(`System admin login attempt: ${email}`);

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP
    global.otpStore = global.otpStore || {};
    global.otpStore[email] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      adminId: authResult.admin._id.toString()
    };

    // Send OTP email
    try {
      const resend = getResend();
      await resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: email,
        subject: 'System Admin Login Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">System Admin Login Verification</h2>
            <p>Your 6-digit verification code is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `,
      });

      res.json({
        success: true,
        requiresOtp: true,
        message: 'A 6-digit code was sent to the email address of system admin.'
      });
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      res.status(500).json({ error: 'Failed to send verification code' });
    }
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/admin/admin-auth/verify-otp
 * Verify OTP and create session
 */
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Check OTP
    const otpData = global.otpStore?.[email];
    if (!otpData) {
      return res.status(400).json({ error: 'No OTP found for this email' });
    }

    if (Date.now() > otpData.expires) {
      if (global.otpStore) delete global.otpStore[email];
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Get admin
    const admin = await Admin.findById(otpData.adminId);
    if (!admin || !admin.isActive) {
      return res.status(400).json({ error: 'Admin not found or inactive' });
    }

    // Clean up OTP
    if (global.otpStore) delete global.otpStore[email];

    // Generate JWT token
    const token = generateAdminToken(admin._id.toString(), admin.role);

    // Update last login
    await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

    // Create audit log for successful login
    await createAuditLogFromRequest(req, {
      userId: admin._id.toString(),
      userType: 'admin',
      userName: admin.name,
      userEmail: admin.email,
      action: 'admin_login',
      category: 'authentication',
      details: `Admin "${admin.name}" logged in successfully`,
      status: 'success'
    });

    const adminResponse = {
      _id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
      lastLogin: admin.lastLogin ? admin.lastLogin.toISOString() : null
    };

    res.json({
      success: true,
      token,
      admin: adminResponse,
      message: 'OTP verification successful'
    });
  } catch (error) {
    console.error('Error during OTP verification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/admin/admin-auth/verify-invitation
 * Verify invitation token
 */
export const verifyInvitation = async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const admin = await Admin.findOne({
      invitationToken: token,
      invitationExpires: { $gt: new Date() },
      isActive: false
    });

    if (!admin) {
      return res.status(400).json({ error: 'Invalid or expired invitation token' });
    }

    res.json({
      success: true,
      email: admin.email,
      role: admin.role
    });
  } catch (error) {
    console.error('Error verifying invitation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/admin/admin-auth/complete-signup
 * Complete admin signup
 */
export const completeSignup = async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { token, name, password } = req.body;

    if (!token || !name || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const admin = await Admin.findOne({
      invitationToken: token,
      invitationExpires: { $gt: new Date() },
      isActive: false
    });

    if (!admin) {
      return res.status(400).json({ error: 'Invalid or expired invitation token' });
    }

    const hashedPassword = await hashPassword(password);

    await Admin.findByIdAndUpdate(admin._id, {
      name: name.trim(),
      password: hashedPassword,
      isActive: true,
      invitationToken: undefined,
      invitationExpires: undefined
    });

    res.json({
      success: true,
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Error completing signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/admin/admin-auth/profile
 * Get admin profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    await connectDB();

    // Get admin from middleware (req as any).admin
    const admin = (req as any).admin;
    
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const adminData = {
      _id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      lastLogin: admin.lastLogin,
    };

    res.json({
      success: true,
      admin: adminData
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
