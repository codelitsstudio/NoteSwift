import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  available?: boolean;
}

export default function FeatureCard({ 
  title, 
  description, 
  icon, 
  onPress,
  available = true 
}: FeatureCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="bg-white rounded-xl p-4 border border-gray-100"
      style={{ width: '48%' }}
      onPress={onPress}
      disabled={!available}
    >
      <View className={`w-12 h-12 bg-blue-50 rounded-full items-center justify-center mb-3 ${
        !available ? 'opacity-50' : ''
      }`}>
        <MaterialIcons name={icon} size={24} color="#3B82F6" />
      </View>
      <Text className={`text-sm font-bold text-gray-900 mb-1 ${
        !available ? 'opacity-50' : ''
      }`}>
        {title}
      </Text>
      <Text className={`text-xs text-gray-500 ${
        !available ? 'opacity-50' : ''
      }`} numberOfLines={2}>
        {description}
      </Text>
      {!available && (
        <View className="mt-2 bg-gray-100 px-2 py-1 rounded-md self-start">
          <Text className="text-xs text-gray-600">Coming Soon</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
