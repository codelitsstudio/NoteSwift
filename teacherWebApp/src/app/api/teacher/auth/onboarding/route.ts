import { NextRequest, NextResponse } from 'next/server';
import { TeacherAuthController } from '@/apiHandling/controllers/auth';

export async function POST(request: NextRequest) {
  try {
    const authController = new TeacherAuthController();
    const result = await authController.updateOnboarding(request);
    
    return result;
  } catch (error: any) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { 
        error: true, 
        message: 'Internal server error during onboarding update',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authController = new TeacherAuthController();
    
    // Extract teacher ID from token or request params
    const searchParams = request.nextUrl.searchParams;
    const teacherId = searchParams.get('teacherId');
    
    if (!teacherId) {
      return NextResponse.json(
        { error: true, message: 'Teacher ID is required' },
        { status: 400 }
      );
    }
    
    // TODO: Get current onboarding status
    // For now, return basic status
    return NextResponse.json({
      error: false,
      data: {
        currentStep: 'personal_info',
        completedSteps: [],
        isComplete: false
      }
    });
    
  } catch (error: any) {
    console.error('Get onboarding status error:', error);
    return NextResponse.json(
      { 
        error: true, 
        message: 'Failed to get onboarding status',
        details: error.message 
      },
      { status: 500 }
    );
  }
}