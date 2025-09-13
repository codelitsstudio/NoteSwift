import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAvatarStore } from '../../stores/avatarStore';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useRouter, usePathname } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function Header() {
  const { avatarEmoji, setAvatar, getRandomEmoji } = useAvatarStore();
  const { logout, user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuVisible, setMenuVisible] = React.useState(false);

  const handleLogout = () => {
    logout();
    setMenuVisible(false);
    Toast.show({
      type: 'error',
      position: 'top',
      text1: 'Signed out',
      text2: 'You have signed out successfully.',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });
    // Force navigation to login screen and replace the entire stack
    router.replace('/onboarding/Login/login');
  };

  // Convert route path to page title
  const getPageTitle = () => {
    if (pathname === "/Home/HomePage") {
      const firstName = user?.full_name?.split(' ')[0] || 'User';
      return `Hi, ${firstName}`;
    }
    if (pathname === "/Learn/LearnPage") return "Learn";
    if (pathname === "/Profile/ProfilePage") return "Profile";
    if (pathname === "/Settings/SettingsPage") return "Settings";
    return "...."; // fallback
  };

  return (<SafeAreaView
  className="bg-white px-6"
  edges={['top', 'left', 'right']} // ignore bottom
  style={{ paddingBottom: 0 }}
>
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 60, // adjust as needed
    }}
  >

        {/* Left: Avatar + Page Title/Greeting */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => setMenuVisible(!menuVisible)}
            className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center"
          >
            <Image
              source={{ uri: avatarEmoji }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          </TouchableOpacity>
          <Text className={pathname === "/Home/HomePage" ? "text-lg font-bold text-black" : "text-2xl font-extrabold text-black"}>
            {getPageTitle()}
          </Text>
        </View>

        {/* Right: Notifications Icon */}
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.push('/Notification/NotificationPage')}
            className="relative"
          >
            <MaterialIcons name="notifications" size={28} color="#374151" />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
