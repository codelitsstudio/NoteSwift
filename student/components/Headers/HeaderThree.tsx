import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";



type HeaderThreeProps = {
  title?: string | null;
  showBack?: boolean;
  showSettings?: boolean;
};

export default function HeaderThree({
  title = null,
  showBack = true,
  showSettings = true,
}: HeaderThreeProps) {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="bg-white border-b border-gray-100">
      <View className="h-14 flex-row items-center justify-between px-3 mb-2 relative">
        {showBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="flex-row items-center py-1 px-0.5"
          >
            <Ionicons name="chevron-back" size={26} color="#0A84FF" />
          </TouchableOpacity>
        ) : (
          <View className="w-14" />
        )}

        {title && (
          <Text
            numberOfLines={1}
            className="text-black text-xl font-bold absolute left-0 right-0 text-center"
          >
            {title}
          </Text>
        )}

        {showSettings ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/Settings/SettingsPage")}
            className="w-14 h-11 items-center justify-center"
          >
            <Ionicons name="settings-outline" size={25} color="#0A84FF" />
          </TouchableOpacity>
        ) : (
          <View className="w-14" />
        )}
      </View>
    </SafeAreaView>
  );
}
