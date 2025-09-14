// profile/components/ProfileHeader.tsx
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../../stores/authStore';
import { useAvatarStore } from '../../../stores/avatarStore';

// Get flame color based on streak days (flame intensity progression)
const getFlameColor = (streakDays: number): string => {
  if (streakDays >= 300) return '#000000'; // 300+ days: Black (hottest)
  if (streakDays >= 200) return '#1a1a1a'; // 200-299 days: Blackish
  if (streakDays >= 100) return '#1565c0'; // 100-199 days: Blue flame
  if (streakDays >= 50) return '#4a148c'; // 50-99 days: Darkish purple
  if (streakDays >= 10) return '#7b1fa2'; // 10-49 days: Pinkish-purple
  if (streakDays >= 3) return '#b71c1c'; // 3-9 days: Dark red
  return '#ff5722'; // 1-2 days: Red (starting fire)
};

// Enhanced stats components
const StreakStat = ({ value, label }: { value: string; label: string }) => {
  const streakDays = parseInt(value) || 0;
  const flameColor = getFlameColor(streakDays);
  
  return (
    <View 
      className="items-center justify-center bg-white rounded-2xl p-4 flex-1 mx-1 border border-gray-100"
    >
      <MaterialIcons 
        name="local-fire-department" 
        size={24} 
        color={flameColor}
      />
      <Text className="text-2xl font-bold text-gray-900 mt-2">{value}</Text>
      <Text className="text-xs text-gray-500 font-medium">{label}</Text>
    </View>
  );
};

const PointsStat = ({ value, label }: { value: string; label: string }) => (
  <View className="items-center justify-center bg-white rounded-2xl p-4 flex-1 mx-1 border border-gray-100">
    <MaterialIcons name="star" size={24} color="#3B82F6" />
    <Text className="text-2xl font-bold text-gray-900 mt-2">{value}<Text className="text-base text-gray-900 font-semibold">XP</Text></Text>
    <Text className="text-xs text-gray-500 font-medium">{label}</Text>
  </View>
);

const RankStat = ({ value, label }: { value: string; label: string }) => (
  <View className="items-center justify-center bg-white rounded-2xl p-4 flex-1 mx-1 border border-gray-100">
    <MaterialIcons name="emoji-events" size={24} color="#FFD700" />
    <Text className="text-2xl font-bold text-gray-900 mt-2">{value}</Text>
    <Text className="text-xs text-gray-500 font-medium">{label}</Text>
  </View>
);

type ProfileHeaderProps = {
  onEditPress?: () => void;
  onAvatarPress?: () => void;
};

const ProfileHeader = ({ onEditPress, onAvatarPress }: ProfileHeaderProps) => {
  const { user } = useAuthStore();
  const { avatarEmoji } = useAvatarStore();
  const [currentStreak, setCurrentStreak] = useState(2); // Test with blue flame!
  
  // Display logic: prioritize uploaded image, fallback to avatar URL, then default
  const getAvatarSource = () => {
    if (user?.profileImage) {
      // User has uploaded a custom image
      return { uri: user.profileImage };
    } else if (user?.avatarEmoji && user.avatarEmoji.startsWith('http')) {
      // User has a Dicebear avatar URL
      return { uri: user.avatarEmoji };
    } else if (avatarEmoji && avatarEmoji.startsWith('http')) {
      // Fallback to store avatar URL
      return { uri: avatarEmoji };
    } else {
      // Default fallback
      return { uri: 'https://api.dicebear.com/9.x/open-peeps/png?seed=default' };
    }
  };

  const avatarSource = getAvatarSource();
  
  return (
    <View className="bg-white">
      {/* Header with back button and edit button */}
      <View className="flex-row justify-between items-center px-5 pt-4 pb-2">
        <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
          <MaterialIcons name="chevron-left" size={24} color="#6B7280" />
        </TouchableOpacity>
        
        <Text className="text-2xl font-bold text-gray-900">Profile</Text>
        
        <TouchableOpacity 
          className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center"
          onPress={onEditPress}
        >
          <MaterialIcons 
            name="edit" 
            size={20} 
            color="#2563EB" 
          />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View className="items-center px-5 pb-6">
        <View className="relative">
          <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8}>
            <Image
              source={avatarSource}
              className="w-24 h-24 rounded-full"
              style={{ resizeMode: 'cover' }}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full items-center justify-center border-2 border-white"
            onPress={onAvatarPress}
          >
            <MaterialIcons name="camera-alt" size={14} color="white" />
          </TouchableOpacity>
        </View>
        
        <Text className="text-2xl font-bold text-gray-900 mt-4">
          {user?.full_name || 'Student Name'}
        </Text>
        <Text className="text-sm font-medium" style={{ color: '#2563EB' }}>
          {user?.email || 'student@example.com'}
        </Text>
        
        {/* Stats Section */}
        <View className="flex-row items-center justify-between w-full mt-6">
          <StreakStat value={currentStreak.toString()} label="Day Streak" />
          <PointsStat value="1.2K" label="Points" />
          <RankStat value="#12" label="Rank" />
        </View>
      </View>
    </View>
  );
};

export default ProfileHeader;