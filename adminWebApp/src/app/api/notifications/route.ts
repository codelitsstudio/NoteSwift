import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Notification from '@/lib/models/Notification';

export async function GET() {
  try {
    await dbConnect();

    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      result: {
        notifications,
        pagination: {
          total: notifications.length,
          page: 1,
          limit: 50,
          pages: 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { type, title, description, subject, message, badge, badgeIcon, thumbnail, showDontShowAgain, buttonText, buttonIcon, status, sentAt, adminId } = body;

    // Validate required fields
    if (!type || !title) {
      return NextResponse.json(
        { success: false, error: 'Type and title are required' },
        { status: 400 }
      );
    }

    // Create notification
    const notification = new Notification({
      type,
      title,
      description,
      subject,
      message,
      badge,
      badgeIcon,
      thumbnail,
      showDontShowAgain,
      buttonText,
      buttonIcon,
      status: status || 'draft',
      sentAt: status === 'sent' ? sentAt || new Date() : null,
      adminId: adminId || 'system'
    });

    await notification.save();

    return NextResponse.json({
      success: true,
      result: { notification }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (!deletedNotification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}