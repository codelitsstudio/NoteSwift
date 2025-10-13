import { NextRequest, NextResponse } from 'next/server';
import { handleCreateAdminSession } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    const { deviceFingerprint, userAgent } = await request.json();

    if (!deviceFingerprint) {
      return NextResponse.json(
        { success: false, error: 'Device fingerprint required' },
        { status: 400 }
      );
    }

    const sessionResult = await handleCreateAdminSession(
      'admin',
      deviceFingerprint,
      request.headers.get('x-forwarded-for') as string || request.headers.get('x-real-ip') as string || 'unknown',
      userAgent || request.headers.get('user-agent') || 'unknown'
    );

    if (!sessionResult.success || !sessionResult.token) {
      return NextResponse.json(
        { success: false, error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Set the cookie server-side
    const response = NextResponse.json({
      success: true,
      redirect: '/dashboard'
    });

    response.cookies.set('admin_session', sessionResult.token, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      httpOnly: true, // Make it httpOnly for security
    });

    return response;
  } catch (error) {
    console.error('Login completion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}