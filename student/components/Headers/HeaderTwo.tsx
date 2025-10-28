import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function HeaderTwo({ title }: { title?: string }) {
  const router = useRouter();

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
