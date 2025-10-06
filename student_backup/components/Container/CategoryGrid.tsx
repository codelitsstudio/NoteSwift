import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const categories = [
  { id: 1, title: "Trending", icon: "trending-up", color: "#2563EB" },
  { id: 2, title: "New", icon: "new-releases", color: "#16A34A" },
  { id: 3, title: "Popular", icon: "star", color: "#F59E0B" },
  { id: 4, title: "Free", icon: "menu-book", color: "#9333EA" },
  { id: 5, title: "For You", icon: "person", color: "#DC2626" },
  { id: 6, title: "Exam Prep", icon: "school", color: "#0EA5E9" },
];

export default function CategoryGrid() {
  return (
    <View className="mb-6">
      <Text className="text-2xl font-bold text-gray-900 mb-3">Categories</Text>
      <View className="flex-row flex-wrap justify-between">
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            className="bg-white w-[30%] mb-4 p-4 rounded-2xl items-center border border-gray-100"
          >
            <MaterialIcons name={cat.icon as any} size={28} color={cat.color} />
            <Text className="text-sm font-medium text-gray-800 mt-2 text-center">
              {cat.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
