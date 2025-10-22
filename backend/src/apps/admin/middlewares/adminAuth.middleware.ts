import { Request, Response, NextFunction } from 'express';
import { verifyAdmin } from '../lib/auth/admin-auth';

/**
 * Middleware to verify admin authentication
 * Expects JWT token in Authorization header: Bearer <token>
 */
export const verifyAdminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('🔐 Verifying admin auth for:', req.method, req.path);
    console.log('🔑 Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
    
    const result = await verifyAdmin(req);

    if (!result.success) {
      console.log('❌ Auth failed:', result.error);
      res.status(401).json({
        success: false,
        error: result.error || 'Unauthorized'
      });
      return;
    }

    console.log('✅ Auth success for admin:', result.admin?.email);
    // Attach admin to request object
    (req as any).admin = result.admin;

    next();
  } catch (error) {
    console.error('❌ Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};
