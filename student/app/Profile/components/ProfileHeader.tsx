// profile/components/ProfileHeader.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../../stores/authStore';
import { useAvatarStore } from '../../../stores/avatarStore';
import { useRouter } from 'expo-router';

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
  const [currentStreak, setCurrentStreak] = useState(0);
  const router = useRouter();

  // --- LOGIN STREAK LOGIC ---
  useEffect(() => {
    const updateStreak = async () => {
      if (!user) return;
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Midnight today

        // Get registration date from user object (should be ISO string)
        // Use createdAt (or created_at) from backend timestamps
        const regDateStr = (user as any)?.createdAt || (user as any)?.created_at;
        let regDate = regDateStr ? new Date(regDateStr) : null;
        if (regDate) regDate.setHours(0, 0, 0, 0);

        // Get last login info from AsyncStorage
        const lastLoginStr = await AsyncStorage.getItem('profile_last_login_date');
        const streakStr = await AsyncStorage.getItem('profile_login_streak');
        let lastLogin = lastLoginStr ? new Date(lastLoginStr) : null;
        if (lastLogin) lastLogin.setHours(0, 0, 0, 0);
        let streak = streakStr ? parseInt(streakStr) : 0;

        // If first login ever, start streak at 1
        if (!lastLogin) {
          streak = 1;
        } else {
          // Calculate day difference
          const diffDays = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 0) {
            // Already logged in today, streak unchanged
          } else if (diffDays === 1) {
            // Consecutive day, increment streak
            streak += 1;
          } else {
            // Missed a day, reset streak
            streak = 1;
          }
        }

        // If registration date is after today, force streak to 1
        if (regDate && regDate > today) {
          streak = 1;
        }

        setCurrentStreak(streak);
        await AsyncStorage.setItem('profile_last_login_date', today.toISOString());
        await AsyncStorage.setItem('profile_login_streak', streak.toString());
      } catch {
        // fallback: just show 1
        setCurrentStreak(1);
      }
    };
    updateStreak();
  }, [user]);

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
      <TouchableOpacity
    className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
    onPress={() => router.back()}  // <-- fix: enable navigation
  >
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
          <PointsStat value="0" label="Points" />
          <RankStat value="NA" label="Rank" />
        </View>
      </View>
    </View>
  );
};

export default ProfileHeader;