export interface Notification {
  _id?: string;
  id: string;
  type: 'homepage' | 'push';
  title: string;
  description?: string;
  badge?: string;
  badgeIcon?: string;
  thumbnail?: string;
  showDontShowAgain?: boolean;
  buttonText?: string;
  buttonIcon?: string;
  subject?: string; // For announcements
  message?: string; // For push notifications
  targetAudience?: 'all' | 'students' | 'admins';
  status: 'draft' | 'sent' | 'scheduled';
  sentAt?: Date;
  scheduledFor?: Date;
  createdBy: string; // Admin ID
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationStats {
  totalSent: number;
  totalDraft: number;
  totalScheduled: number;
  lastSent?: Date;
}