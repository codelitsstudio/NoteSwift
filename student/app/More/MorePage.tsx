
// /More.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function MorePage() {
  const { logout } = useAuthStore();
  const router = useRouter();

  const confirmLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            logout();
            Toast.show({
              type: 'error',
              position: 'top',
             text1: 'Logged out',
              text2: 'You have successfully logged out of your account.',
              visibilityTime: 3000,
              autoHide: true,
              topOffset: 50,
            });
            router.replace('/');
          }
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6 py-4">
      <View className="flex-1 justify-start items-center">
       <Text className="text-3xl font-bold mb-6">Wanna logout BITCH ?</Text>
      <Text className="text-xl font-bold mb-6">Click that button then</Text>


        <TouchableOpacity
          onPress={confirmLogout}
          className="w-full bg-red-500 rounded-lg py-4 items-center"
        >
          <Text className="text-white font-semibold text-lg">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
