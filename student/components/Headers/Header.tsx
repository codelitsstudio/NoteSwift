import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAvatarStore } from '../../stores/avatarStore';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useCourseStore } from '../../stores/courseStore';
import { useRouter, usePathname } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';

export default function Header() {
  const { avatarEmoji } = useAvatarStore();
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { enrolledCourses, courses } = useCourseStore();
  const router = useRouter();
  const pathname = usePathname();

  // Check if user has any Pro course enrollments
  const hasProEnrollment = enrolledCourses.some(enrolledCourseId => {
    const course = courses.find(c => (c.id || c._id) === enrolledCourseId);
    return course?.type === 'pro';
  });

  // Get avatar source with same priority logic as ProfileHeader
  const getAvatarSource = () => {
    if (user?.profileImage) {
      // User has uploaded a custom image
      return { uri: user?.profileImage };
    } else if (user?.avatarEmoji && user.avatarEmoji.startsWith('http')) {
      // User has a Dicebear avatar URL
      return { uri: user?.avatarEmoji };
    } else if (avatarEmoji && avatarEmoji.startsWith('http')) {
      // Fallback to store avatar URL
      return { uri: avatarEmoji };
    } else {
      // Default fallback
      return { uri: 'https://api.dicebear.com/9.x/open-peeps/png?seed=default' };
    }
  };

  // Convert route path to page title
  const getPageTitle = () => {
    const firstName = user?.full_name?.split(' ')[0] || 'User';
    
    if (pathname === "/Home/HomePage") {
      return `Hi, ${firstName}`;
    }
    if (pathname === "/Learn/LearnPage") return `Hi, ${firstName}`;
    if (pathname === "/More/MorePage") return `Hi, ${firstName}`;
    if (pathname === "/Test/TestPage") return `Hi, ${firstName}`;
    if (pathname === "/Ask/AskPage") return `Hi, ${firstName}`;
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
  onPress={() => router.push('/Profile/ProfilePage')}
  className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center"
>
  <Image
    source={getAvatarSource()}
    style={{ width: 40, height: 40, borderRadius: 20 }}
  />
</TouchableOpacity>

          <Text className={
            pathname === "/Home/HomePage" || 
            pathname === "/Learn/LearnPage" || 
            pathname === "/More/MorePage" || 
            pathname === "/Test/TestPage" || 
            pathname === "/Ask/AskPage" 
              ? "text-lg font-semibold text-black" 
              : "text-2xl font-bold text-black"
          }>
            {getPageTitle()}
          </Text>
        </View>

        {/* Right: Crown Icon (if Pro) + Notifications Icon + Settings Icon */}
        <View className="flex-row items-center gap-4">
          {hasProEnrollment && (
            <TouchableOpacity
              onPress={() => router.push('/Home/ProMarketplace')}
              accessibilityLabel="Pro Marketplace"
            >
              <MaterialCommunityIcons name="crown" size={26} color="#2563eb" />
            </TouchableOpacity>
          )}
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
          <TouchableOpacity
            onPress={() => router.push('/AllCourses/AllCoursesPage')}
            className="ml-1"
            accessibilityLabel="Settings"
          >
            <Entypo name="open-book" size={26} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
