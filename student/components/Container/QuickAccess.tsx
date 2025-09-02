import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type AccessItem = {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

const accessItems: AccessItem[] = [
  { label: "My Batch", icon: "group" },
  { label: "My History", icon: "history" },
  { label: "My Doubts", icon: "help-outline" },
  { label: "Leaderboard", icon: "leaderboard" },
  { label: "Courses", icon: "menu-book" },
  { label: "My Rank", icon: "emoji-events" },
  { label: "Bookmarks", icon: "bookmark-outline" },
  { label: "Downloads", icon: "download" },
];

const QuickAccess: React.FC = () => {
  return (
    <View className="bg-white p-4 rounded-xl border border-gray-100">
      <View className="flex-row flex-wrap justify-between">
        {accessItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="w-[22%] mb-4 items-center"
            activeOpacity={0.7}
          >
            <MaterialIcons name={item.icon} size={28} color="#374151" />
            <Text className="text-[12px] text-center mt-1 text-gray-700">
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default QuickAccess;
