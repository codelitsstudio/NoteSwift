import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

type AccessItem = {
  label: string;
  icon: any; // require('path')
};

const accessItems: AccessItem[] = [
  { label: "My Batch", icon: require("../../assets/images/mybatch.png") },
  { label: "My History", icon: require("../../assets/images/history.png") },
  { label: "My Doubts", icon: require("../../assets/images/doubt.png") },
  { label: "Leaderboard", icon: require("../../assets/images/leaderboard.png") },
  { label: "My Courses", icon: require("../../assets/images/courses.png") },
  { label: "My Rank", icon: require("../../assets/images/rank.png") },
  { label: "Bookmarks", icon: require("../../assets/images/bookmark.png") },
  { label: "Downloads", icon: require("../../assets/images/downloads.png") },
];

const QuickAccess: React.FC = () => {
  return (
    <View className="bg-white p-4 rounded-xl shadow-sm">

      <View className="flex-row flex-wrap justify-between">
        {accessItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="w-[22%] mb-4 items-center"
            activeOpacity={0.7}
          >
            <Image
              source={item.icon}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
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
