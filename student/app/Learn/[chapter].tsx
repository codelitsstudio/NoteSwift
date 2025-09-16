//learn/[chapter].tsx

import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text } from "react-native";
import HeaderFifth from "../../components/Headers/HeaderFifth";
import Icon from "react-native-vector-icons/MaterialIcons";
import { chapters } from "../../utils/chapterData";
import ChapterTabs from "../../components/Tabs/ChapterTabs";
import { getLessonProgress, updateLessonProgress } from "../../api/lessonProgress";
import { useAuthStore } from "../../stores/authStore";

export default function ChapterPage() {
  const router = useRouter();
  const { chapter } = useLocalSearchParams(); // e.g. "chapter-1"
  const key = String(chapter).toLowerCase();
  const data = chapters[key];
  const { user } = useAuthStore();

  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.id || !data) return;
      try {
        const res = await getLessonProgress(key);
        if (res.success && res.data) {
          setProgress(res.data.progress || 0);
          setCompletedLessons((res.data.completedLessons || []).map((l: any) => l.lessonId));
        }
      } catch (e) {
        // fallback: no progress
        setProgress(0);
        setCompletedLessons([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [user?.id, key]);

  // Handler to update progress when a lesson is started/completed
  const handleLessonProgress = async (lessonId: string, completed: boolean) => {
    if (!user?.id || !data) return;
    try {
      const res = await updateLessonProgress(key, lessonId, completed, data.lessons?.length || 1);
      if (res.success && res.data) {
        setProgress(res.data.progress || 0);
        setCompletedLessons((res.data.completedLessons || []).map((l: any) => l.lessonId));
      }
    } catch (e) {
      // Optionally show error
    }
  };


  if (!data) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
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
      <ChapterTabs
        data={data}
        progress={progress}
        completedLessons={completedLessons}
        onLessonProgress={handleLessonProgress}
        loading={loading}
      />
    </View>
  );
}
