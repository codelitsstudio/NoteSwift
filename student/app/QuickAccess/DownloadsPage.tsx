// app/QuickAccess/DownloadsPage.tsx
import React from "react";
import { ScrollView, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const DownloadsPage = () => {
  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="flex-row items-center mb-4">
        <MaterialIcons name="download" size={28} color="#4B5563" />
        <Text className="text-2xl font-bold ml-2">Downloads</Text>
      </View>
      <Text className="text-gray-700 mb-2">Downloaded materials:</Text>
      <View className="bg-white p-4 rounded-xl shadow mb-2">
        <Text>• React Native Basics PDF</Text>
        <Text>• Expo Navigation Slides</Text>
        <Text>• JavaScript Cheat Sheet</Text>
      </View>
    </ScrollView>
  );
};

export default DownloadsPage;
