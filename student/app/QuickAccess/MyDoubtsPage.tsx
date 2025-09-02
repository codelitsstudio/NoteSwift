// app/QuickAccess/MyDoubtsPage.tsx
import React from "react";
import { ScrollView, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const MyDoubtsPage = () => {
  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="flex-row items-center mb-4">
        <MaterialIcons name="help-outline" size={28} color="#4B5563" />
        <Text className="text-2xl font-bold ml-2">My Doubts</Text>
      </View>
      <Text className="text-gray-700 mb-2">Pending questions:</Text>
      <View className="bg-white p-4 rounded-xl shadow mb-2">
        <Text>• How to optimize React Native performance?</Text>
        <Text>• Difference between Redux and Context API?</Text>
      </View>
      <Text className="text-gray-700 mt-2">Answered questions:</Text>
      <View className="bg-white p-4 rounded-xl shadow">
        <Text>• How to use useEffect properly?</Text>
      </View>
    </ScrollView>
  );
};

export default MyDoubtsPage;
