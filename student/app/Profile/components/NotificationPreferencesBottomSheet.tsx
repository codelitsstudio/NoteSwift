import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import Toast from 'react-native-toast-message';
import { NotificationPreferences } from '../../../api/student/user';

interface NotificationPreferencesBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  currentPreferences: NotificationPreferences;
  onSave: (preferences: NotificationPreferences) => void;
}

const NotificationPreferencesBottomSheet: React.FC<NotificationPreferencesBottomSheetProps> = ({
  isVisible,
  onClose,
  currentPreferences,
  onSave,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>(currentPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<'enable' | 'disable' | null>(null);

  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
      setPreferences(currentPreferences);
      setLastAction(null); // Reset action when modal opens
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible, currentPreferences]);

  const handleClose = () => {
    setPreferences(currentPreferences); // Reset to original values
    setLastAction(null); // Reset action state
    onClose();
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setLastAction(null); // Reset action when individual toggle is used
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(preferences);
      Toast.show({
        type: 'success',
        text1: 'Preferences Updated!',
        text2: 'Your notification settings have been saved',
        visibilityTime: 3000,
      });
      onClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.message || 'Failed to update preferences',
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const notificationItems = [
    {
      key: 'push_notifications' as keyof NotificationPreferences,
      icon: 'notifications',
      title: 'Push Notifications',
      description: 'Receive notifications on your device',
      category: 'General'
    },
    {
      key: 'email_notifications' as keyof NotificationPreferences,
      icon: 'email',
      title: 'Email Notifications',
      description: 'Get important updates via email',
      category: 'General'
    },
    {
      key: 'lesson_reminders' as keyof NotificationPreferences,
      icon: 'schedule',
      title: 'Lesson Reminders',
      description: 'Daily reminders to continue learning',
      category: 'Learning'
    },
    {
      key: 'study_streak_reminders' as keyof NotificationPreferences,
      icon: 'local-fire-department',
      title: 'Study Streak Alerts',
      description: 'Maintain your learning streak',
      category: 'Learning'
    },
    {
      key: 'progress_updates' as keyof NotificationPreferences,
      icon: 'trending-up',
      title: 'Progress Updates',
      description: 'Weekly learning progress summaries',
      category: 'Progress'
    },
    {
      key: 'weekly_progress_report' as keyof NotificationPreferences,
      icon: 'assessment',
      title: 'Weekly Reports',
      description: 'Detailed weekly progress reports',
      category: 'Progress'
    },
    {
      key: 'course_announcements' as keyof NotificationPreferences,
      icon: 'campaign',
      title: 'Course Announcements',
      description: 'Important updates about your courses',
      category: 'Content'
    },
    {
      key: 'new_content_alerts' as keyof NotificationPreferences,
      icon: 'fiber-new',
      title: 'New Content Alerts',
      description: 'Notify when new lessons are available',
      category: 'Content'
    }
  ];

  const groupedItems = notificationItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof notificationItems>);

  const renderNotificationItem = (item: typeof notificationItems[0]) => (
    <View key={item.key} className="flex-row items-center justify-between py-4 px-5">
      <View className="flex-row items-center flex-1">
        <View className="bg-blue-50 rounded-full p-2 mr-3">
          <MaterialIcons name={item.icon as any} size={20} color="#3B82F6" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1">
            {item.title}
          </Text>
          <Text className="text-sm text-gray-600">
            {item.description}
          </Text>
        </View>
      </View>
      <Switch
        value={preferences[item.key]}
        onValueChange={() => handleToggle(item.key)}
        trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
        thumbColor={preferences[item.key] ? '#3B82F6' : '#F3F4F6'}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? 0 : -1}
      snapPoints={['25%', '90%']}
      onClose={handleClose}
      enablePanDownToClose
      enableDynamicSizing={false}
      keyboardBehavior="extend"
    >
      <BottomSheetScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-4 px-5">
          <Text className="text-xl font-bold text-gray-900">
            Notification Preferences
          </Text>
          <TouchableOpacity onPress={handleClose} className="p-2">
            <MaterialIcons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View className="mb-6 mx-5 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
          <View className="flex-row items-start" style={{ gap: 12 }}>
            <View className="bg-blue-100 rounded-full p-2 mt-1">
              <MaterialIcons name="tune" size={18} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-900 mb-1">
                Customize Your Experience
              </Text>
              <Text className="text-sm text-gray-700 leading-5">
                Choose which notifications you want to receive to stay updated without being overwhelmed. You can change these settings anytime.
              </Text>
            </View>
          </View>
        </View>

        {/* Notification Categories */}
        {Object.entries(groupedItems).map(([category, items]) => (
          <View key={category} className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3 px-5">
              {category}
            </Text>
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mx-5 overflow-hidden">
              {items.map((item, index) => (
                <View key={item.key}>
                  {renderNotificationItem(item)}
                  {index < items.length - 1 && (
                    <View className="h-px bg-gray-100 mx-5" />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Quick Actions */}
        <View className="mx-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Quick Actions</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => {
                setLastAction('enable');
                setPreferences({
                  push_notifications: true,
                  email_notifications: true,
                  lesson_reminders: true,
                  progress_updates: true,
                  course_announcements: true,
                  study_streak_reminders: true,
                  weekly_progress_report: true,
                  new_content_alerts: true,
                });
              }}
              className={`flex-1 ${lastAction === 'enable' 
                ? 'bg-customBlue border-customBlue' 
                : 'bg-gray-50 border-gray-200'} border rounded-xl p-4`}
            >
              <Text className={`text-center font-semibold ${lastAction === 'enable' 
                ? 'text-white' 
                : 'text-gray-700'}`}>
                Enable All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setLastAction('disable');
                setPreferences({
                  push_notifications: false,
                  email_notifications: false,
                  lesson_reminders: false,
                  progress_updates: false,
                  course_announcements: false,
                  study_streak_reminders: false,
                  weekly_progress_report: false,
                  new_content_alerts: false,
                });
              }}
              className={`flex-1 ${lastAction === 'disable' 
                ? 'bg-customBlue border-customBlue' 
                : 'bg-gray-50 border-gray-200'} border rounded-xl p-4`}
            >
              <Text className={`text-center font-semibold ${lastAction === 'disable' 
                ? 'text-white' 
                : 'text-gray-700'}`}>
                Disable All
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <View className="px-5">
          <ButtonPrimary
            title={isLoading ? "Saving..." : "Save Preferences"}
            onPress={handleSave}
            disabled={isLoading}
          />
          <TouchableOpacity
            onPress={handleClose}
            className="mt-3 mb-2 p-3 bg-gray-100 rounded-lg"
          >
            <Text className="text-center text-gray-700 font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default NotificationPreferencesBottomSheet;