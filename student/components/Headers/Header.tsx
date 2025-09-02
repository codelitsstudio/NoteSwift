import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAvatarStore } from '../../stores/avatarStore';
import { useAuthStore } from '../../stores/authStore';
import { useRouter, usePathname } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function Header() {
  const { avatarEmoji, setAvatar, getRandomEmoji } = useAvatarStore();
  const { logout } = useAuthStore();
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
    router.replace('/');
  };

  // Convert route path to page title
  const getPageTitle = () => {
    if (pathname === "/Home/HomePage") return "Home";
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

        {/* Left: Big Page Title */}
        <Text className="text-4xl font-extrabold text-black">
          {getPageTitle()}
        </Text>

        {/* Right: Icons + Avatar */}
        <View className="flex-row items-center gap-4">
          <TouchableOpacity>
            <MaterialIcons name="notifications" size={28} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMenuVisible(!menuVisible)}
            className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center"
          >
   <Image
  source={{ uri: avatarEmoji }} // now PNG URL
  style={{ width: 40, height: 40, borderRadius: 20 }}
/>
          </TouchableOpacity>


        </View>
      </View>
    </SafeAreaView>
  );
}
