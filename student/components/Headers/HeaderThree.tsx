import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function HeaderTwo() {
  const router = useRouter();

  const goToSettings = () => {
    router.push("/Home/HomePage"); // navigate to your settings page
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
          onPress={goToSettings}
          className="w-14 h-11 items-center justify-center"
        >
          <Ionicons name="settings-outline" size={25} color="#0A84FF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
