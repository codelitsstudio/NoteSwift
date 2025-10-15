import { Request, Response } from 'express';
import connectDB from '../lib/mongoose';
import Notification from '../models/Notification';

/**
 * GET /api/admin/notifications
 * List all notifications
 */
export const listNotifications = async (req: Request, res: Response) => {
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
  }
};

/**
 * POST /api/admin/notifications
 * Create a new notification
 */
export const createNotification = async (req: Request, res: Response) => {
  try {
    await connectDB();

    const { 
      type, title, description, subject, message, badge, badgeIcon, 
      thumbnail, showDontShowAgain, buttonText, buttonIcon, status, 
      sentAt, adminId 
    } = req.body;

    // Validate required fields
    if (!type || !title) {
      return res.status(400).json({ 
        success: false, 
        error: 'Type and title are required' 
      });
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

    res.json({ success: true, result: { notification } });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, error: 'Failed to create notification' });
  }
};

/**
 * DELETE /api/admin/notifications/:id
 * Delete a notification
 */
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    await connectDB();

    const deletedNotification = await Notification.findByIdAndDelete(req.params.id);

    if (!deletedNotification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
};

/**
 * GET /api/admin/notifications/active/homepage
 * Get active homepage notification
 */
export const getActiveHomepageNotification = async (req: Request, res: Response) => {
  try {
    await connectDB();

    const notification = await Notification.findOne({
      type: 'homepage',
      status: 'sent'
    }).sort({ sentAt: -1 });

    if (!notification) {
      return res.json({ success: true, data: null });
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
