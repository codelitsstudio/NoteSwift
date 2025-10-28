import { Expo, ExpoPushMessage, ExpoPushToken } from 'expo-server-sdk';

class PushNotificationService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo();
  }

  // Send push notification to a single token
  async sendPushNotification(token: string, title: string, body: string, data?: any) {
    // Check if token is valid
    if (!Expo.isExpoPushToken(token)) {
      console.error(`Push token ${token} is not a valid Expo push token`);
      return { success: false, error: 'Invalid push token' };
    }

    // Create the message
    const message: ExpoPushMessage = {
      to: token,
      title,
      body,
      data: data || {},
      sound: 'default',
      priority: 'default',
    };

    try {
      const ticket = await this.expo.sendPushNotificationsAsync([message]);
      console.log('Push notification sent:', ticket);

      return { success: true, ticket };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Send push notification to multiple tokens
  async sendPushNotifications(tokens: string[], title: string, body: string, data?: any) {
    // Filter valid tokens
    const validTokens = tokens.filter(token => Expo.isExpoPushToken(token));

    if (validTokens.length === 0) {
      console.error('No valid push tokens provided');
      return { success: false, error: 'No valid push tokens' };
    }

    // Create messages
    const messages: ExpoPushMessage[] = validTokens.map(token => ({
      to: token,
      title,
      body,
      data: data || {},
      sound: 'default',
      priority: 'default',
    }));

    try {
      const tickets = await this.expo.sendPushNotificationsAsync(messages);
      console.log('Push notifications sent:', tickets);

      return { success: true, tickets };
    } catch (error) {
      console.error('Error sending push notifications:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const pushNotificationService = new PushNotificationService();