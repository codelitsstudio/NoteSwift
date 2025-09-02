// app/QuickAccess/LeaderboardPage.tsx
import React from "react";
import { ScrollView, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const LeaderboardPage = () => {
  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="flex-row items-center mb-4">
        <MaterialIcons name="leaderboard" size={28} color="#4B5563" />
        <Text className="text-2xl font-bold ml-2">Leaderboard</Text>
      </View>
      <Text className="text-gray-700 mb-2">Top Performers:</Text>
      <View className="bg-white p-4 rounded-xl shadow mb-2">
        <Text>🥇 Alice Johnson – 980 points</Text>
        <Text>🥈 Bob Smith – 875 points</Text>
        <Text>🥉 Carol Williams – 860 points</Text>
      </View>
    </ScrollView>
  );
};

export default LeaderboardPage;
