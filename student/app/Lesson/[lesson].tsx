// app/lesson/[lesson].tsx
import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import LessonDetailCard from "./LessonDetail/LessonDetailCard";
import { lessons } from "../../utils/lessonData";
import FooterNav from "./LessonDetail/FooterNav";

export default function LessonPage() {
  const router = useRouter();
  const { lesson } = useLocalSearchParams(); // e.g. "lesson-1"

  const key = String(lesson);
  const data = lessons[key];

  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-600 text-base">Lesson not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Map tags to conform to LessonData type
  const allowedTypes = ["video", "live", "notes", "attachments"] as const;
  const mappedTags =
    data.tags?.map((tag: any) => ({
      ...tag,
      type: allowedTypes.includes(tag.type) ? tag.type : undefined,
    })) ?? undefined;

  const lessonData = {
    ...data,
    tags: mappedTags,
  };

return (
  <View className="flex-1 bg-gray-100"> 
    <SafeAreaView className="flex-1">
      <LessonDetailCard
        lesson={lessonData}
        onPrevious={() => router.back()}
        onBack={() => router.back()}
        onNext={() => {
          /* navigation to next lesson */
        }}
      />
    </SafeAreaView>

    {/* Footer outside safe area so it hugs bottom */}
    <FooterNav
      onPrevious={() => router.back()}
      onNext={() => {}}
    />
  </View>
);
}
