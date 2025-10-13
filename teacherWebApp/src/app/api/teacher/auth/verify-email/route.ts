import { NextRequest, NextResponse } from 'next/server';
import { TeacherAuthController } from '@/apiHandling/controllers/auth';

export async function POST(request: NextRequest) {
  try {
    const authController = new TeacherAuthController();
    const result = await authController.verifyEmail(request);
    
    return result;
  } catch (error: any) {
    console.error('Verify email API error:', error);
    return NextResponse.json(
      { 
        error: true, 
        message: 'Internal server error during email verification',
        details: error.message 
      },
      { status: 500 }
    );
  }
}