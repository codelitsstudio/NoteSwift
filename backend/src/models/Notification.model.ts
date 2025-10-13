import mongoose, { Schema, models } from 'mongoose';
import { Notification } from '@shared/model/common/Notification';

const notificationSchema = new Schema<Notification>({
  id: { type: String, required: true, unique: true },
  type: {
    type: String,
    required: true,
    enum: ['homepage', 'push']
  },
  title: { type: String, required: true },
  description: { type: String },
  badge: { type: String },
  badgeIcon: { type: String },
  thumbnail: { type: String },
  showDontShowAgain: { type: Boolean, default: true },
  buttonText: { type: String },
  buttonIcon: { type: String },
  subject: { type: String }, // For announcements
  message: { type: String }, // For push notifications
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'admins'],
    default: 'all'
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'scheduled'],
    default: 'draft'
  },
  sentAt: { type: Date },
  scheduledFor: { type: Date },
  createdBy: { type: String, required: true }, // Admin ID
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
notificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const NotificationModel = models.Notification || mongoose.model<Notification>('Notification', notificationSchema);