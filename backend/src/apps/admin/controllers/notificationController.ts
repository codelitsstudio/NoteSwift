import { Request, Response, NextFunction } from 'express';
import connectDB from '@core/lib/mongoose';
import Notification from '../models/Notification';
import { Student } from '../../student/models/students/Student.model';
import { pushNotificationService } from '../../../services/pushNotificationService';

/**
 * GET /api/admin/notifications
 * List all notifications
 */
export const listNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();

    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
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
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
      return;
  }
};

/**
 * POST /api/admin/notifications
 * Create a new notification
 */
export const createNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();

    const { 
      type, title, description, subject, message, badge, badgeIcon, 
      thumbnail, showDontShowAgain, buttonText, buttonIcon, status, 
      sentAt, adminId 
    } = req.body;

    // Validate required fields
    if (!type || !title) {
      res.status(400).json({ 
        success: false, 
        error: 'Type and title are required' 
      });
      return;
    }

    // Get admin from request (set by middleware)
    const admin = (req as any).admin;
    const createdByEmail = admin?.email || 'system';

    // Generate unique ID
    const uniqueId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create notification
    const notification = new Notification({
      id: uniqueId,
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
      createdBy: createdByEmail
    });

    await notification.save();

    // Send push notifications if type is 'push'
    if (type === 'push' && status === 'sent') {
      try {
        // Get all students with push tokens
        const students = await Student.find({ pushToken: { $exists: true, $ne: null } });
        const pushTokens = students.map(student => student.pushToken).filter(Boolean);

        if (pushTokens.length > 0) {
          console.log(`Sending push notification to ${pushTokens.length} students`);
          
          await pushNotificationService.sendPushNotifications(
            pushTokens,
            title,
            message || description || '',
            {
              type: 'admin_notification',
              notificationId: notification._id,
              adminEmail: createdByEmail
            }
          );
          
          console.log('Push notifications sent successfully');
        } else {
          console.log('No students with push tokens found');
        }
      } catch (pushError) {
        console.error('Error sending push notifications:', pushError);
        // Don't fail the request if push notification fails
      }
    }

    res.json({ success: true, result: { notification } });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, error: 'Failed to create notification' });
      return;
  }
};

/**
 * DELETE /api/admin/notifications/:id
 * Delete a notification
 */
export const deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();

    const deletedNotification = await Notification.findByIdAndDelete(req.params.id);

    if (!deletedNotification) {
      res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
      return;
  }
};

/**
 * GET /api/admin/notifications/active/homepage
 * Get active homepage notification
 */
export const getActiveHomepageNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();

    const notification = await Notification.findOne({
      type: 'homepage',
      status: 'sent'
    }).sort({ sentAt: -1 });

    if (!notification) {
      res.json({ success: true, data: null });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error fetching active homepage notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch active notification' 
    });
  }
};
