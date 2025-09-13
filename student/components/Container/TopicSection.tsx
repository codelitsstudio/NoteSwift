import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

const topics = [
  { id: 1, title: "Arts & Humanities" },
  { id: 2, title: "Business" },
  { id: 3, title: "Computer Science" },
  { id: 4, title: "Mathematics" },
  { id: 5, title: "Languages" },
  { id: 6, title: "Engineering" },
];

export default function TopicsSection() {
  return (
    <View className="mb-6 mt-6">
      <Text className="text-2xl font-bold text-gray-900 mb-3">Topics</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {topics.map((topic) => (
          <TouchableOpacity
            key={topic.id}
            className="bg-white px-4 py-3 mr-3 rounded-2xl border border-gray-100"
          >
            <Text className="text-gray-800 font-medium">{topic.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
