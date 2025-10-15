import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface AdminSession {
  adminId: string;
  username: string;
  loginTime: number;
  deviceFingerprint: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create a secure JWT token for admin session
 */
export async function createAdminSession(sessionData: AdminSession): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);

  const token = await new SignJWT({
    ...sessionData,
    type: 'admin_session'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Date.now() + SESSION_DURATION)
    .sign(secret);

  return token;
}

/**
 * Verify and decode admin session token
 */
export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Validate token type and required fields
    if (payload.type !== 'admin_session' || !payload.adminId || !payload.username) {
      return null;
    }

    return {
      adminId: payload.adminId as string,
      username: payload.username as string,
      loginTime: payload.loginTime as number,
      deviceFingerprint: payload.deviceFingerprint as string,
      ipAddress: payload.ipAddress as string,
      userAgent: payload.userAgent as string,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Generate a simple device fingerprint hash for backend validation
 * Uses request metadata instead of browser APIs
 */
export function generateDeviceFingerprint(userAgent: string, ip: string): string {
  const fingerprint = [
    userAgent,
    ip,
    new Date().getTimezoneOffset(),
  ].join('|');

  // Simple hash function for fingerprint
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}