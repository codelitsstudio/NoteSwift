import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import { useNotificationStore } from '../../stores/notificationStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const NotificationPage = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();

  useEffect(() => {
    // Mark all notifications as read when user opens the page
    if (unreadCount > 0) {
      markAllAsRead();
    }
  }, []);

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
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white mx-4 mb-3 p-4 rounded-xl border border-gray-200"
      onPress={() => markAsRead(item.id)}
    >
      <View className="flex-row items-start">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: `${getNotificationColor(item.type)}20` }}
        >
          <MaterialIcons
            name={getNotificationIcon(item.type)}
            size={20}
            color={getNotificationColor(item.type)}
          />
        </View>
        
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-base mb-1">
            {item.title}
          </Text>
          <Text className="text-gray-600 text-sm leading-5 mb-2">
            {item.message}
          </Text>
          <Text className="text-gray-400 text-xs">
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        
        {!item.read && (
          <View className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2" />
        )}
      </View>
    </TouchableOpacity>
  );

  if (notifications.length === 0) {
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
            Your notifications will appear here once you've received them.
          </Text>

          {/* Link to Historical Notifications */}
          <View className="flex-row items-center mt-6">
            <Text className="text-sm text-gray-600">
              Missing notifications?
            </Text>
            <TouchableOpacity>
              <Text className="text-sm font-semibold text-blue-600 ml-1">
                Help
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-900">
           New Updates
          </Text>
          {notifications.some(n => !n.read) && (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text className="text-blue-600 font-semibold text-sm">
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

export default NotificationPage;
