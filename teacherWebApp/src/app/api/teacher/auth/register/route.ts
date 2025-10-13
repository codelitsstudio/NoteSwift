import { NextRequest, NextResponse } from 'next/server';
import { TeacherAuthController } from '@/apiHandling/controllers/auth';

export async function POST(request: NextRequest) {
  try {
    const authController = new TeacherAuthController();
    const result = await authController.register(request);
    
    return result;
  } catch (error: any) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { 
        error: true, 
        message: 'Internal server error during registration',
        details: error.message 
      },
      { status: 500 }
    );
  }
}