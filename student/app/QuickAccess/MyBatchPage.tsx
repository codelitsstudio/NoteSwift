// app/QuickAccess/MyBatchPage.tsx
import React from "react";
import { ScrollView, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const MyBatchPage = () => {
  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="flex-row items-center mb-4">
        <MaterialIcons name="group" size={28} color="#4B5563" />
        <Text className="text-2xl font-bold ml-2">My Batch</Text>
      </View>
      <Text className="text-gray-700 mb-2">Your current batch members:</Text>
      <View className="bg-white p-4 rounded-xl shadow mb-2">
        <Text>1. Alice Johnson</Text>
        <Text>2. Bob Smith</Text>
        <Text>3. Carol Williams</Text>
      </View>
      <Text className="text-gray-700 mt-2">Upcoming batch sessions:</Text>
      <View className="bg-white p-4 rounded-xl shadow">
        <Text>• Session 1: React Native Basics – Sep 5</Text>
        <Text>• Session 2: Expo Navigation – Sep 7</Text>
      </View>
    </ScrollView>
  );
};

export default MyBatchPage;
