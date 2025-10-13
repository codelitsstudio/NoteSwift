import express, { Request, Response } from 'express';
import { NotificationModel } from '../models/Notification.model';

const router = express.Router();

// Get all notifications
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, status, limit = 50, page = 1 } = req.query;

    const query: any = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const notifications = await NotificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await NotificationModel.countDocuments(query);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      },
      message: "Notifications retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Get notification by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await NotificationModel.findById(req.params.id);
    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }
    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notification' });
  }
});

// Create new notification
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const notificationData = {
      ...req.body,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdBy: req.body.adminId || 'system' // In real app, get from auth middleware
    };

    const notification = new NotificationModel(notificationData);
    await notification.save();

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
});

// Update notification
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await NotificationModel.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.json({
      success: true,
      data: notification,
      message: 'Notification updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

// Delete notification
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await NotificationModel.findByIdAndDelete(req.params.id);

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
});

// Send notification (mark as sent)
router.post('/:id/send', async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await NotificationModel.findByIdAndUpdate(
      req.params.id,
      {
        status: 'sent',
        sentAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    // Here you would implement actual sending logic:
    // - For push notifications: send to FCM/APNs
    // - For homepage notifications: trigger real-time updates
    // - For announcements: send emails if needed

    res.json({
      success: true,
      data: notification,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send notification' });
  }
});

// Get active homepage notification for students
router.get('/active/homepage', async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await NotificationModel.findOne({
      type: 'homepage',
      status: 'sent'
    }).sort({ sentAt: -1 });

    if (!notification) {
      res.json({
        success: true,
        data: null,
        message: "No active homepage notification found"
      });
      return;
    }

    res.json({
      success: true,
      data: notification,
      message: "Active homepage notification retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching active homepage notification:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active notification"
    });
  }
});

// Get notification statistics
router.get('/stats/overview', async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await NotificationModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          lastSent: { $max: '$sentAt' }
        }
      }
    ]);

    const totalSent = stats.find(s => s._id === 'sent')?.count || 0;
    const totalDraft = stats.find(s => s._id === 'draft')?.count || 0;
    const totalScheduled = stats.find(s => s._id === 'scheduled')?.count || 0;
    const lastSent = stats.find(s => s._id === 'sent')?.lastSent;

    res.json({
      success: true,
      data: {
        totalSent,
        totalDraft,
        totalScheduled,
        lastSent
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notification statistics' });
  }
});

export default router;