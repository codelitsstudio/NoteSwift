import { Request, Response } from 'express';
import { createAdminSession, verifyAdminSession, type AdminSession } from '../lib/auth';
import connectDB from '../lib/mongoose';

/**
 * POST /api/admin/auth/complete-login
 * Complete login and create session
 */
export const completeLogin = async (req: Request, res: Response) => {
  try {
    await connectDB();
    
    const { deviceFingerprint, userAgent } = req.body;

    if (!deviceFingerprint) {
      return res.status(400).json({
        success: false,
        error: 'Device fingerprint required'
      });
    }

    // Get IP address from various headers
    const ipAddress = req.headers['x-forwarded-for'] as string || 
                     req.headers['x-real-ip'] as string || 
                     req.ip || 
                     'unknown';

    const userAgentString = userAgent || req.headers['user-agent'] || 'unknown';

    // Create session data
    const sessionData: AdminSession = {
      adminId: 'admin', // TODO: Get from authenticated admin
      username: 'admin',
      loginTime: Date.now(),
      deviceFingerprint,
      ipAddress,
      userAgent: userAgentString
    };

    // Create JWT token
    const token = await createAdminSession(sessionData);

    // Set cookie
    res.cookie('admin_session', token, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true
    });

    return res.status(200).json({
      success: true,
      redirect: '/dashboard'
    });
  } catch (error: any) {
    console.error('Login completion error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * GET /api/admin/auth/session
 * Get current session info
 */
export const getSession = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.admin_session;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No session found'
      });
    }

    const session = await verifyAdminSession(token);

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session'
      });
    }

    // Check if session is close to expiry (within 1 hour)
    const now = Date.now();
    const timeUntilExpiry = (session.loginTime + 24 * 60 * 60 * 1000) - now;
    const needsRefresh = timeUntilExpiry < 60 * 60 * 1000; // 1 hour

    return res.status(200).json({
      success: true,
      session: {
        username: session.username,
        loginTime: session.loginTime,
        needsRefresh
      }
    });
  } catch (error: any) {
    console.error('Session validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Session validation failed'
    });
  }
};

/**
 * POST /api/admin/auth/session/refresh
 * Refresh session token
 */
export const refreshSession = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.admin_session;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No session found'
      });
    }

    const session = await verifyAdminSession(token);

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session'
      });
    }

    // Create new session with updated timestamp
    const newSessionData: AdminSession = {
      ...session,
      loginTime: Date.now()
    };

    const newToken = await createAdminSession(newSessionData);

    // Set new cookie
    res.cookie('admin_session', newToken, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true
    });

    return res.status(200).json({
      success: true,
      message: 'Session refreshed'
    });
  } catch (error: any) {
    console.error('Session refresh error:', error);
    return res.status(500).json({
      success: false,
      error: 'Session refresh failed'
    });
  }
};

/**
 * POST /api/admin/auth/logout
 * Logout and clear session
 */
export const logout = async (req: Request, res: Response) => {
  try {
    // Clear the session cookie
    res.clearCookie('admin_session', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      httpOnly: true
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

// ==================== REGULAR ADMIN LOGIN (Non-System Admin) ====================

import { Resend } from 'resend';
import crypto from 'crypto';

// Lazy initialize Resend to ensure env vars are loaded
const getResend = () => new Resend(process.env.RESEND_API_KEY);

// OTP storage for regular admins (use Redis in production)
declare global {
  var regularAdminOtpStore: Record<string, { otp: string; expires: number; adminId: string; password: string }> | undefined;
}

/**
 * POST /api/admin/auth/login
 * Regular admin login (super_admin, admin) - sends OTP
 */
export const regularAdminLogin = async (req: Request, res: Response) => {
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
      return res.status(401).json({ error: authResult.error || 'Authentication failed' });
    }

    // Prevent system admin from logging in through regular login
    if (authResult.admin.role === 'system_admin') {
      return res.status(403).json({ 
        error: 'System administrators must use the dedicated admin portal at /admin/login' 
      });
    }

    console.log(`Regular admin login attempt: ${email} (role: ${authResult.admin.role})`);

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP with password for verification
    global.regularAdminOtpStore = global.regularAdminOtpStore || {};
    global.regularAdminOtpStore[email] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      adminId: authResult.admin._id.toString(),
      password // Store password for re-verification during OTP check
    };

    // Send OTP email using the React component template
    try {
      const resend = getResend();
      
      // Create HTML for OTP email (matching the OtpEmail component style)
      const otpHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <tr>
                      <td style="padding: 40px 40px 20px 40px;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Your NoteSwift Admin Login Code</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 40px 20px 40px;">
                        <p style="margin: 0; font-size: 16px; line-height: 24px; color: #666666;">
                          Use the following verification code to complete your login:
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 40px 30px 40px;">
                        <div style="background-color: #f6f9fc; border-radius: 6px; padding: 24px; text-align: center;">
                          <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #2563eb; font-family: 'Courier New', monospace;">
                            ${otp}
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 40px 30px 40px;">
                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: #666666;">
                          This code will expire in <strong>10 minutes</strong>. If you didn't request this code, please ignore this email.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 40px 40px 40px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 12px; line-height: 16px; color: #999999;">
                          This is an automated message from NoteSwift Admin. Please do not reply to this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: 'NoteSwift Admin <noteswift@codelitsstudio.com>',
        to: email,
        subject: 'Your NoteSwift Admin Login Code',
        html: otpHtml,
      });

      res.json({
        success: true,
        requiresOtp: true,
        message: 'A 6-digit verification code has been sent to your email.'
      });
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      res.status(500).json({ error: 'Failed to send verification code' });
    }
  } catch (error) {
    console.error('Error during regular admin login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/admin/auth/verify-otp
 * Verify OTP for regular admin and return JWT token
 */
export const regularAdminVerifyOtp = async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { email, otp, password } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Check OTP store
    const otpData = global.regularAdminOtpStore?.[email];

    if (!otpData) {
      return res.status(400).json({ error: 'No OTP found. Please request a new code.' });
    }

    // Check expiry
    if (Date.now() > otpData.expires) {
      if (global.regularAdminOtpStore) {
        delete global.regularAdminOtpStore[email];
      }
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP code.' });
    }

    // Re-verify password if provided (extra security)
    if (password && password !== otpData.password) {
      return res.status(401).json({ error: 'Password verification failed.' });
    }

    // Clean up OTP
    if (global.regularAdminOtpStore) {
      delete global.regularAdminOtpStore[email];
    }

    // Get admin details and generate token
    const Admin = (await import('../models/Admin')).default;
    const admin = await Admin.findById(otpData.adminId);

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Generate JWT token
    const { generateAdminToken } = await import('../lib/auth/admin-auth');
    const token = generateAdminToken(admin._id.toString(), admin.role);

    console.log(`✅ Regular admin login successful: ${email} (role: ${admin.role})`);

    res.json({
      success: true,
      token,
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error verifying OTP for regular admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
