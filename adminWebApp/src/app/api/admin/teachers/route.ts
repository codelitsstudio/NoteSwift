import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Read status query if provided
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || '';

    // Placeholder: return empty list. Replace with real backend integration.
    const teachers: any[] = [];

    return NextResponse.json({ success: true, data: { teachers } }, { status: 200 });
  } catch (err: any) {
    console.error('Admin teachers GET error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
