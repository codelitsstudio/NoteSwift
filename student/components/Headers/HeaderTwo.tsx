import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function HeaderTwo({ title }: { title?: string }) {
  const router = useRouter();
  const pathname = usePathname(); // Get current route path

  const handleShare = async () => {
    // Construct full URL of the current page
    const urlToShare = `https://noteswift.in${pathname}`;
    try {
      await Share.share(
        Platform.select({
          ios: { url: urlToShare },
          default: { message: urlToShare },
        }) as any
      );
    } catch {
      Linking.openURL(urlToShare).catch(() =>
        console.warn("Cannot open URL:", urlToShare)
      );
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="bg-white ">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => router.back()} 
          className="p-2"
        >
          <Ionicons name="chevron-back" size={22} color="#374151" />
        </TouchableOpacity>
        
        <Text className="text-lg font-semibold text-gray-900">
          {title || ''}
        </Text>
        
        <View className="w-10" />
      </View>
    </SafeAreaView>
  );
}
