// app/lesson/[lesson].tsx
import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import LessonDetailCard from "./LessonDetail/LessonDetailCard";
import { lessons } from "../../utils/lessonData";
import FooterNav from "./LessonDetail/FooterNav";
import { updateModuleProgress, getModuleProgress } from "../../api/lessonProgress";
import { useAuthStore } from "../../stores/authStore";

export default function LessonPage() {
  const router = useRouter();
  const { lesson, courseId } = useLocalSearchParams(); // e.g. "lesson-1"
  const { user } = useAuthStore();

  const key = String(lesson);
  const data = lessons[key];
  const [videoCompleted, setVideoCompleted] = useState(false);

  // Check backend for video completion status on mount
  useEffect(() => {
    const checkVideoCompletion = async () => {
      if (courseId) {
        try {
          const res = await getModuleProgress(courseId as string, 1); // Module 1 for video
          if (res.success && res.data && res.data.moduleProgress?.videoCompleted) {
            setVideoCompleted(true);
          }
        } catch (error) {
          console.error('Error checking video completion:', error);
        }
      }
    };
    checkVideoCompletion();
  }, [courseId]);

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
      // Module 1 VIDEO completion (separate from notes completion)
      await updateModuleProgress(courseId as string, 1, true);
      setVideoCompleted(true);
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  };

  const handleVideoCompletionStatusChange = (completed: boolean) => {
    // Update local state when video completion status changes
    setVideoCompleted(completed);
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
        onVideoCompletionStatusChange={handleVideoCompletionStatusChange}
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
