import React from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type AppStatusProps = {
  latestVersion?: string | null;
};

const AppStatus: React.FC<AppStatusProps> = ({ latestVersion }) => {
  const handleInfoPress = () => {
    Alert.alert(
      'App Status Info',
      'This tab shows the current sync status, app version, storage usage, and backup status. "Latest Version" displays the app version you are currently running.'
    );
  };
  return (
    <View className="px-5 mb-2">
      <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-900">App Status</Text>
          <TouchableOpacity onPress={handleInfoPress} hitSlop={{top:8,bottom:8,left:8,right:8}}>
            <MaterialIcons name="info" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-between items-center">
          <View className="items-center flex-1 px-2">
            <View className="w-14 h-14 rounded-full items-center justify-center mb-3 bg-blue-50">
              <MaterialIcons name="cloud-done" size={26} color="#007AFF" />
            </View>
            <Text className="text-xs text-gray-600 font-medium text-center leading-tight">All Synced</Text>
          </View>
          <View className="items-center flex-1 px-2">
            <View className="w-14 h-14 rounded-full items-center justify-center mb-3 bg-blue-50">
              <MaterialIcons name="system-update-alt" size={26} color="#007AFF" />
            </View>
            <Text className="text-xs text-gray-600 font-medium text-center leading-tight">
              Latest Version{latestVersion ? `: v${latestVersion}` : ''}
            </Text>
          </View>
          <View className="items-center flex-1 px-2">
            <View className="w-14 h-14 rounded-full items-center justify-center mb-3 bg-blue-50">
              <MaterialIcons name="storage" size={26} color="#007AFF" />
            </View>
            <Text className="text-xs text-gray-600 font-medium text-center leading-tight">0.03GB Used</Text>
          </View>
          <View className="items-center flex-1 px-2">
            <View className="w-14 h-14 rounded-full items-center justify-center mb-3 bg-blue-50">
              <MaterialIcons name="backup" size={26} color="#007AFF" />
            </View>
            <Text className="text-xs text-gray-600 font-medium text-center leading-tight">Backup</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AppStatus;
