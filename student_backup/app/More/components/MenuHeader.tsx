// more/components/MenuHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  onSettingsPress: () => void;
};

const MenuHeader = ({ onSettingsPress }: Props) => {
  return (
    <View className="px-5 pt-4 pb-2">
      {/* Header with settings button */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-gray-900">More</Text>
        
        <TouchableOpacity 
          className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center"
          onPress={onSettingsPress}
        >
         <MaterialIcons name="settings" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* App Status & Updates Card */}
      <View className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-900">App Status</Text>
          <MaterialIcons name="info" size={20} color="#6B7280" />
        </View>
        <View className="flex-row justify-between">
          <View className="items-center flex-1">
            <View className="w-12 h-12 rounded-full items-center justify-center mb-2 bg-gray-50">
              <MaterialIcons name="cloud-done" size={24} color="#6B7280" />
            </View>
            <Text className="text-xs text-gray-600 font-medium text-center">All Synced</Text>
          </View>
          
          <View className="items-center flex-1">
            <View className="w-12 h-12 rounded-full items-center justify-center mb-2 bg-gray-50">
              <MaterialIcons name="system-update-alt" size={24} color="#6B7280" />
            </View>
            <Text className="text-xs text-gray-600 font-medium text-center">Latest Version</Text>
          </View>
          
          <View className="items-center flex-1">
            <View className="w-12 h-12 rounded-full items-center justify-center mb-2 bg-gray-50">
              <MaterialIcons name="storage" size={24} color="#6B7280" />
            </View>
            <Text className="text-xs text-gray-600 font-medium text-center">2.1GB Used</Text>
          </View>
          
          <View className="items-center flex-1">
            <View className="w-12 h-12 rounded-full items-center justify-center mb-2 bg-gray-50">
              <MaterialIcons name="backup" size={24} color="#6B7280" />
            </View>
            <Text className="text-xs text-gray-600 font-medium text-center">Auto Backup</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MenuHeader;