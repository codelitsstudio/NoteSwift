//learn/[chapter].tsx
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text } from "react-native";
import HeaderFifth from "../../components/Headers/HeaderFifth";
import Icon from "react-native-vector-icons/MaterialIcons";
import { chapters } from "../../utils/chapterData";
import ChapterTabs from "../../components/Tabs/ChapterTabs";

export default function ChapterPage() {
  const router = useRouter();
  const { chapter } = useLocalSearchParams(); // e.g. "chapter-1"
  const key = String(chapter).toLowerCase();
  const data = chapters[key];

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-600">Chapter not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <HeaderFifth title={data.title} subtitle={data.subtitle} onBack={() => router.back()} />

      {/* Info Box */}
      <View className="px-4 py-3">
        <Text className="text-sm text-gray-700">{data.description}</Text>
        <View className="flex-row items-center mt-2">
          <Icon name="schedule" size={18} color="#2563eb" />
          <Text className="ml-1 mt-2 text-base text-gray-600">{data.duration}</Text>
        </View>
      </View>

      {/* Tabs + content */}
      <ChapterTabs data={data} />
    </View>
  );
}
