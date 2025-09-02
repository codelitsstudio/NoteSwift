// app/QuickAccess/MyHistoryPage.tsx
import React from "react";
import { ScrollView, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const MyHistoryPage = () => {
  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="flex-row items-center mb-4">
        <MaterialIcons name="history" size={28} color="#4B5563" />
        <Text className="text-2xl font-bold ml-2">My History</Text>
      </View>
      <Text className="text-gray-700 mb-2">Recent activities:</Text>
      <View className="bg-white p-4 rounded-xl shadow mb-2">
        <Text>• Completed "Intro to React Native"</Text>
        <Text>• Asked a question in "State Management" session</Text>
        <Text>• Joined "Advanced Hooks" webinar</Text>
      </View>
    </ScrollView>
  );
};

export default MyHistoryPage;
