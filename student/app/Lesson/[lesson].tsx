// app/lesson/[lesson].tsx
import React, { useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import LessonDetailCard from "./LessonDetail/LessonDetailCard";
import { lessons } from "../../utils/lessonData";
import FooterNav from "./LessonDetail/FooterNav";
import { updateModuleProgress } from "../../api/lessonProgress";
import { useAuthStore } from "../../stores/authStore";

export default function LessonPage() {
  const router = useRouter();
  const { lesson, courseId } = useLocalSearchParams(); // e.g. "lesson-1"
  const { user } = useAuthStore();

  const key = String(lesson);
  const data = lessons[key];
  const [videoCompleted, setVideoCompleted] = useState(false);

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

  const handleVideoCompleted = async () => {
    if (!courseId || !user?.id) return;
    
    try {
      // Module 1 video completion
      await updateModuleProgress(courseId as string, 1, true);
      setVideoCompleted(true);
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
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
        onVideoCompleted={handleVideoCompleted}
      />
    </SafeAreaView>

    {/* Footer outside safe area so it hugs bottom */}
    <FooterNav
      onPrevious={() => router.back()}
      onNext={() => {}}
      videoCompleted={videoCompleted}
    />
  </View>
);
}
