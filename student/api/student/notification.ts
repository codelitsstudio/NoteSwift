import api from "../axios";
import { NotificationData } from "../../components/Picker/NotificationSheet";
import { Notification } from "@shared/model/common/Notification";

export const fetchActiveHomepageNotification = async (): Promise<NotificationData | null> => {
  try {
    const response = await api.get("/notifications/active/homepage");
    // The backend returns { success: true, data: notification } or { success: true, data: null }
    const notification: Notification | null = response.data.success ? response.data.data : null;

    if (!notification) {
      return null;
    }

    // Transform the backend Notification to NotificationData format
    return {
      id: notification.id,
      badge: notification.badge,
      badgeIcon: notification.badgeIcon,
      title: notification.title,
      description: notification.description || '',
      thumbnail: notification.thumbnail,
      showDontShowAgain: notification.showDontShowAgain,
      buttonText: notification.buttonText,
      buttonIcon: notification.buttonIcon,
    };
  } catch (error: any) {
    console.error('Error fetching active homepage notification:', error.response?.data || error.message);
    return null;
  }
};