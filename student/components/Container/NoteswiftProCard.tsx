import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function NoteswiftProCard() {
  const router = useRouter();

  return (
    <View className="bg-blue-600 rounded-3xl p-5 mb-6">
      <Text className="text-white text-xl font-bold mb-2">Noteswift Pro</Text>
      <Text className="text-white text-base mb-4">
        Unlock premium classes, videos, notes and exclusive resources.
      </Text>
      <TouchableOpacity
        className="bg-white px-5 py-2 rounded-full self-start"
        onPress={() => router.push("/Home/NoteswiftProDetail")}
      >
        <Text className="text-blue-600 font-semibold">Learn More</Text>
      </TouchableOpacity>
    </View>
  );
}
