import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, SectionList, RefreshControl } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import api from '../../api/axios';

interface Notification {
  _id: string;
  id: string;
  type: 'homepage' | 'push' | 'enrollment' | 'question_answer' | 'admin_broadcast';
  title: string;
  description?: string;
  message?: string;
  subject?: string;
  badge?: string;
  badgeIcon?: string;
  thumbnail?: string;
  status: 'draft' | 'sent' | 'scheduled';
  sentAt?: string;
  createdAt: string;
  read?: boolean;
}

interface QuestionUpdate {
  _id: string;
  title: string;
  questionText: string;
  status: string;
  answersCount: number;
  hasNewAnswer: boolean;
  lastAnswerAt?: string;
  createdAt: string;
}

const NotificationPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [questionUpdates, setQuestionUpdates] = useState<QuestionUpdate[]>([]);
  const [allRead, setAllRead] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch admin notifications
  const fetchNotifications = async () => {
    try {
      // Fetch all sent notifications (don't restrict to push only)
      const response = await api.get('/notifications?status=sent');
      console.log('Notifications response:', response.data);
      // Defensive handling for different response shapes
      const notificationsArray = response.data?.data?.notifications || response.data?.notifications || response.data?.result?.notifications || [];
      if (Array.isArray(notificationsArray)) {
        const mapped = notificationsArray.map((notif: any) => ({
          ...notif,
          // preserve the type returned by the API when available
          type: notif.type || 'admin_broadcast',
          // preserve read flag if provided, otherwise default to false
          read: typeof notif.read === 'boolean' ? notif.read : false
        }));
        setNotifications(mapped);
      } else {
        console.warn('Unexpected notifications payload:', response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch question updates (questions with new answers)
  const fetchQuestionUpdates = async () => {
    try {
      const response = await api.get('/questions');
      if (response.data.success) {
        const questions = response.data.result.questions;
        const updates = questions
          .filter((q: any) => q.answersCount > 0)
          .map((q: any) => ({
            _id: q._id,
            title: q.title,
            questionText: q.questionText,
            status: q.status,
            answersCount: q.answersCount,
            hasNewAnswer: true, // For now, assume all have new answers
            lastAnswerAt: q.updatedAt,
            createdAt: q.createdAt
          }));
        setQuestionUpdates(updates);
      }
    } catch (error) {
      console.error('Error fetching question updates:', error);
    }
  };

  // Combine all notifications into sections
  const getNotificationSections = () => {
    const adminNotifs = notifications.map(notif => ({
      id: notif._id,
      title: notif.title,
      message: notif.message || notif.description || '',
      type: notif.type,
      timestamp: new Date(notif.sentAt || notif.createdAt).getTime(),
      read: allRead ? true : notif.read || false,
    }));

    const questionNotifs = questionUpdates.map(update => ({
      id: update._id,
      title: `New answer to: ${update.title}`,
      message: `Your question received ${update.answersCount} answer${update.answersCount > 1 ? 's' : ''}`,
      type: 'question_answer' as const,
      timestamp: new Date(update.lastAnswerAt || update.createdAt).getTime(),
      read: allRead ? true : false,
    }));

    return [
      { title: 'Admin Broadcasts', data: adminNotifs },
      { title: 'Question Updates', data: questionNotifs }
    ].filter(section => section.data.length > 0);
  };

  const loadAllData = async () => {
    await Promise.all([fetchNotifications(), fetchQuestionUpdates()]);
  };

  useEffect(() => {
    loadAllData().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return 'school';
      case 'question_answer':
        return 'question-answer';
      case 'admin_broadcast':
        return 'campaign';
      case 'success':
        return 'check-circle';
      case 'warning':
        return 'warning';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'enrollment':
        return '#3B82F6';
      case 'question_answer':
        return '#10B981';
      case 'admin_broadcast':
        return '#F59E0B';
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View className="bg-gray-100 px-4 py-3 mb-2 mt-4">
      <Text className="text-base font-bold text-gray-800">{section.title}</Text>
    </View>
  );

  const renderNotification = ({ item }: { item: { id: string; title: string; message: string; type: string; timestamp: number; read: boolean } }) => (
    <TouchableOpacity
      className="bg-white mx-4 mb-3 p-4 rounded-xl border border-gray-200 shadow-sm"
      onPress={() => {
        // Mark as read logic can be added here
        console.log('Notification pressed:', item.id);
      }}
    >
      <View className="flex-row items-start">
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-4 flex-shrink-0"
          style={{ backgroundColor: `${getNotificationColor(item.type)}20` }}
        >
          <MaterialIcons
            name={getNotificationIcon(item.type)}
            size={24}
            color={getNotificationColor(item.type)}
          />
        </View>

        <View className="flex-1 min-h-[60px]">
          <View className="flex-row items-start justify-between mb-1">
            <Text className="text-gray-900 font-semibold text-base flex-1 mr-2" numberOfLines={2}>
              {item.title}
            </Text>
            {!item.read && (
              <View className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
            )}
          </View>
          <Text className="text-gray-600 text-sm leading-5 mb-2" numberOfLines={3}>
            {item.message}
          </Text>
          <Text className="text-gray-400 text-xs">
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const sections = getNotificationSections();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 items-center justify-center">
          <View className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></View>
          <Text className="text-gray-600 mt-4">Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (sections.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 items-center justify-center pb-20">

          {/* Notification Image */}
          <View className="w-32 h-28 rounded-2xl items-center justify-center">
            <Image
              source={require('../../assets/images/notification.png')}
              style={{ width: 160, height: 160 }}
              resizeMode="contain"
            />
          </View>

          {/* Main Text */}
          <Text className="text-2xl font-bold text-gray-800 mt-8">
            No notifications yet
          </Text>

          {/* Sub Text */}
          <Text className="text-base text-gray-500 mt-2 text-center px-10">
            Your notifications will appear here once you receive admin broadcasts or teacher answers to your questions.
          </Text>

          {/* Link to Historical Notifications */}
          <View className="flex-row items-center mt-6">
            <Text className="text-sm text-gray-600">
              Pull down to refresh
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
          <View className="bg-white py-3 border-b border-gray-100 items-center justify-center">
            {sections.some(s => s.data.some(n => !n.read)) && (
              <TouchableOpacity
                className="bg-blue-50 px-4 py-2 rounded-full"
                onPress={() => {
                  setAllRead(true);
                }}
              >
                <Text className="text-blue-600 font-semibold text-sm">
                  Mark all as read
                </Text>
              </TouchableOpacity>
            )}
          </View>

      {/* Notifications List */}
      <SectionList
        sections={sections}
        renderItem={renderNotification}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      />
    </SafeAreaView>
  );
};

export default NotificationPage;
