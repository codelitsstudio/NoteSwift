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

export default function HeaderTwo() {
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
    <SafeAreaView edges={["top", "left", "right"]} className="bg-white border-b border-gray-100">
      <View className="h-14 flex-row items-center justify-between px-3 mb-2">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="flex-row items-center py-1 px-0.5"
        >
          <Ionicons name="chevron-back" size={26} color="#0A84FF" />
          <Text numberOfLines={1} className="text-buttonBlue text-xl font-normal ml-1">
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleShare}
          className="w-14 h-11 items-center justify-center"
        >
          <Ionicons name="share-outline" size={25} color="#0A84FF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
