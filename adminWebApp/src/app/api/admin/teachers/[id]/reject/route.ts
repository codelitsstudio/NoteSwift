import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json().catch(() => ({}));
    console.log('Reject teacher', id, body);

    // Placeholder: in real app, call backend to reject and send email
    return NextResponse.json({ success: true, data: { id, approvalStatus: 'rejected', reason: body.reason || null } }, { status: 200 });
  } catch (err: any) {
    console.error('Reject error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
