import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Notification from '@/lib/models/Notification';

export async function GET() {
  try {
    await dbConnect();

    const notification = await Notification.findOne({
      type: 'homepage',
      status: 'sent'
    }).sort({ sentAt: -1 });

    if (!notification) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error fetching active homepage notification:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch active notification' },
      { status: 500 }
    );
  }
}