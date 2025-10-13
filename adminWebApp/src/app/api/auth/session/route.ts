import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 401 }
      );
    }

    const session = await verifyAdminSession(token);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Check if session is close to expiry (within 1 hour)
    const now = Date.now();
    const timeUntilExpiry = (session.loginTime + 24 * 60 * 60 * 1000) - now;
    const needsRefresh = timeUntilExpiry < 60 * 60 * 1000; // 1 hour

    return NextResponse.json({
      success: true,
      session: {
        username: session.username,
        loginTime: session.loginTime,
        needsRefresh,
      }
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Session validation failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 401 }
      );
    }

    const session = await verifyAdminSession(token);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Create a new session token with extended expiry
    const { createAdminSession } = await import('@/lib/auth');

    const newSessionData = {
      ...session,
      loginTime: Date.now(), // Refresh the login time
    };

    const newToken = await createAdminSession(newSessionData);

    // Set new cookie
    const response = NextResponse.json({
      success: true,
      message: 'Session refreshed'
    });

    response.cookies.set('admin_session', newToken, {
      path: '/',
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Session refresh failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Session cleared'
    });

    // Clear the cookie by setting it to expire immediately
    response.cookies.set('admin_session', '', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      httpOnly: true,
    });

    return response;
  } catch (error) {
    console.error('Session clear error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear session' },
      { status: 500 }
    );
  }
}