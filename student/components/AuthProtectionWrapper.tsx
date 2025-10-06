import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface AuthProtectionWrapperProps {
  children: React.ReactNode;
  isOnboardingScreen?: boolean;
}

export function AuthProtectionWrapper({ children, isOnboardingScreen = false }: AuthProtectionWrapperProps) {
  const { isLoggedIn, user } = useAuthStore();

  // If user is authenticated and trying to access onboarding screens
  if (isLoggedIn && user && isOnboardingScreen) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <View className="bg-red-50 border border-red-200 rounded-xl p-6 items-center">
          <MaterialIcons name="security" size={48} color="#EF4444" />
          <Text className="text-xl font-bold text-red-600 mt-4 text-center">
            Access Denied
          </Text>
          <Text className="text-gray-600 mt-2 text-center leading-6">
            You are already logged in. You cannot access authentication screens while authenticated.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/Home/HomePage')}
            className="bg-red-500 px-6 py-3 rounded-lg mt-6"
          >
            <Text className="text-white font-semibold">Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}
