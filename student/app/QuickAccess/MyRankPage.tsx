// app/QuickAccess/MyRankPage.tsx
import React from "react";
import { ScrollView, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const MyRankPage = () => {
  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="flex-row items-center mb-4">
        <MaterialIcons name="emoji-events" size={28} color="#4B5563" />
        <Text className="text-2xl font-bold ml-2">My Rank</Text>
      </View>
      <Text className="text-gray-700 mb-2">Current rank:</Text>
      <View className="bg-white p-4 rounded-xl shadow mb-2">
        <Text>🏆 Rank: 5</Text>
        <Text>Points: 750</Text>
        <Text>Next rank: 700 points required</Text>
      </View>
    </ScrollView>
  );
};

export default MyRankPage;
