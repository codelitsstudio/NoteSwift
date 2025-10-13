import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    // read body for notify flag
    const body = await request.json().catch(() => ({}));
    console.log('Approve teacher', id, body);

    // Placeholder: in real app, call backend to approve
    return NextResponse.json({ success: true, data: { id, approvalStatus: 'approved' } }, { status: 200 });
  } catch (err: any) {
    console.error('Approve error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
