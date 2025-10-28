import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import api from '../api/axios';

// Check if we're in Expo Go (which doesn't support push notifications in SDK 53+)
const isExpoGo = Constants.appOwnership === 'expo';

// Configure notification handler only if not in Expo Go
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// Request permissions
export const requestNotificationPermissions = async () => {
  if (isExpoGo) {
    console.log('Push notifications are not supported in Expo Go. Use a development build to test push notifications.');
    return false;
  }

  if (!Device.isDevice) {
    console.log('Notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }

  return true;
};

// Get push token
export const getPushToken = async (): Promise<string | null> => {
  if (isExpoGo) {
    console.log('Push notifications are not supported in Expo Go. Use a development build to test push notifications.');
    return null;
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

// Register push token with backend
export const registerPushToken = async (token: string): Promise<void> => {
  try {
    await api.post('/student/auth/push-token', { pushToken: token });
    console.log('Push token registered successfully');
  } catch (error) {
    console.error('Error registering push token:', error);
  }
};

// Send test notification (for development)
export const sendTestNotification = async () => {
  if (isExpoGo) {
    console.log('Push notifications are not supported in Expo Go. Use a development build to test push notifications.');
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification",
      body: "This is a test notification from NoteSwift",
      data: { type: 'test' },
    },
    trigger: null, // Send immediately
  });
};

// Set up notification listener
export const setupNotificationListener = () => {
  if (isExpoGo) {
    console.log('Push notifications are not supported in Expo Go. Use a development build to test push notifications.');
    return { foregroundSubscription: null, responseSubscription: null };
  }

  // Handle notifications that arrive when app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received in foreground:', notification);
    // You can add custom handling here, like showing an in-app notification
  });

  // Handle notification responses (when user taps on notification)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification response received:', response);
    const { notification } = response;
    // Handle navigation or other actions based on notification data
    // For example, navigate to question detail if it's a question answer notification
  });

  return { foregroundSubscription, responseSubscription };
};