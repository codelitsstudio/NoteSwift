import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Modal, Image } from 'react-native';
import api from '../api/axios';

interface AppBlockProps {
  children: React.ReactNode;
}

interface AppUpdateStatus {
  isActive: boolean;
  title: string;
  subtitle: string;
}

const AppBlock: React.FC<AppBlockProps> = ({ children }) => {
  const [updateStatus, setUpdateStatus] = useState<AppUpdateStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAppUpdateStatus = async () => {
    try {
      const response = await api.get('/app-update/status');
      if (response.data.success) {
        setUpdateStatus(response.data.data);
      }
    } catch (error) {
      console.error('Failed to check app update status:', error);
      // If we can't check, assume no update to avoid blocking users unnecessarily
      setUpdateStatus({ isActive: false, title: '', subtitle: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAppUpdateStatus();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="text-gray-600 mt-4">Checking for updates...</Text>
      </View>
    );
  }

  // If no update is active, show the normal app
  if (!updateStatus?.isActive) {
    return <>{children}</>;
  }

  // Show update blocker modal
  return (
   <Modal
      visible={true}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-white justify-between">
        {/* Background decorative circles */}
        <View className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-30" style={{ transform: [{ translateX: 100 }, { translateY: -100 }] }} />
        <View className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full opacity-40" style={{ transform: [{ translateX: -150 }, { translateY: 150 }] }} />
        
        {/* Content */}
        <View className="flex-1 justify-center items-start px-8">
          {/* App Icon */}
          <View className="mb-4 items-start w-full">
            <Image
              source={require('../assets/images/logo1.png')}
              className="w-40 h-40"
            />
          </View>

          {/* Title */}
          <Text className="text-3xl font-bold text-gray-900 mb-6 px-4 text-left w-full">
            {updateStatus.title}
          </Text>

          {/* Subtitle */}
          <Text className="text-base text-gray-600 leading-6 px-4 mb-2 text-left w-full">
            {updateStatus.subtitle}
          </Text>
          {/* Update Button - moved just below subtitle */}
          <View className="w-full px-8 mt-8">
            <TouchableOpacity
              onPress={() => Alert.alert('Notification', 'You will be notified when the App is available.')}
              className="bg-blue-500 rounded-full py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">
                Notify me
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AppBlock;