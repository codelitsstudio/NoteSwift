import React from 'react';
import { View, Text, TouchableOpacity, Pressable, TouchableWithoutFeedback, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAvatarStore } from '../../stores/avatarStore';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function Header() {
  const avatarEmoji = useAvatarStore(state => state.avatarEmoji);
  const { logout } = useAuthStore();
  const router = useRouter();
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


  return (
    <SafeAreaView className="bg-white px-6">
      <View className="flex-row items-center justify-between py-2 shadow-sm relative">
        {/* Left: Logo + Title */}
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center">
            <Image
              source={require('../../assets/images/logo.png')}
              className="w-14 h-14"
              resizeMode="contain"
            />
          </View>
          <Text className="ml-3 text-xl px-2 font-bold text-black">NoteSwift</Text>
        </View>

        {/* Right: Icons + Avatar */}
        <View className="flex-row items-center gap-4 relative">
          <TouchableOpacity>
            <MaterialIcons name="search" size={24} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="notifications" size={24} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMenuVisible(!menuVisible)}
            className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center"
          >
            <Text className="text-xl">{avatarEmoji}</Text>
          </TouchableOpacity>

          {/* Popup Menu */}
          {menuVisible && (
            <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
              <View className="absolute top-12 right-0 z-50 w-40 rounded-md bg-white shadow-md border border-gray-200">
                <Pressable
                  className="px-4 py-3 border-b border-gray-100"
                  onPress={() => {
                    setMenuVisible(false);
                    router.push('/');
                  }}
                >
                  <Text className="text-gray-800">Profile</Text>
                </Pressable>
                <Pressable
                  className="px-4 py-3"
                  onPress={handleLogout}
                >
                  <Text className="text-red-600">Sign Out</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}