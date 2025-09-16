//learn/[chapter].tsx

import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text } from "react-native";
import HeaderFifth from "../../components/Headers/HeaderFifth";
import Icon from "react-native-vector-icons/MaterialIcons";
import { chapters } from "../../utils/chapterData";
import ChapterTabs from "../../components/Tabs/ChapterTabs";
import { getLessonProgress, updateLessonProgress, getModuleProgress } from "../../api/lessonProgress";
import { useAuthStore } from "../../stores/authStore";
import { useFocusEffect } from "@react-navigation/native";

export default function ChapterPage() {
  const router = useRouter();
  const { chapter } = useLocalSearchParams(); // e.g. "chapter-1"
  const key = String(chapter).toLowerCase();
  const data = chapters[key];
  const { user } = useAuthStore();

  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [moduleProgress, setModuleProgress] = useState<{[key: number]: number}>({});
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      // Refresh progress when component comes back into focus
      // This handles the case when user navigates back from notes
      const refreshOnFocus = async () => {
        if (!user?.id || !data) return;
        
        try {
          // Quick refresh of module progress
          const moduleProgressData: {[key: number]: number} = {};
          if (data.lessons) {
            for (let i = 0; i < data.lessons.length; i++) {
              try {
                const moduleRes = await getModuleProgress(key, i + 1);
                if (moduleRes.success && moduleRes.data) {
                  moduleProgressData[i + 1] = moduleRes.data.moduleProgress?.progress || 0;
                }
              } catch (error) {
                moduleProgressData[i + 1] = moduleProgress[i + 1] || 0; // Keep existing value on error
              }
            }
          }
          setModuleProgress(moduleProgressData);

          // Refresh overall progress
          const res = await getLessonProgress(key);
          if (res.success && res.data) {
            setProgress(res.data.progress || 0);
            setCompletedLessons((res.data.completedLessons || []).map((l: any) => l.lessonId));
          }
        } catch (error) {
          console.error('Error refreshing progress on focus:', error);
        } finally {
          // Always set loading to false after fetch attempt
          setLoading(false);
        }
      };

      refreshOnFocus();
    }, [user?.id, key, data])
  );

  // Handler to update progress when a lesson is started/completed
  const handleLessonProgress = async (lessonId: string, completed: boolean) => {
    if (!user?.id || !data) return;
    try {
      const res = await updateLessonProgress(key, lessonId, completed, data.lessons?.length || 1);
      if (res.success && res.data) {
        setProgress(res.data.progress || 0);
        setCompletedLessons((res.data.completedLessons || []).map((l: any) => l.lessonId));

        // Refresh module progress after update
        const lessonIndex = data.lessons?.findIndex(lesson => lesson.id === lessonId) ?? -1;
        if (lessonIndex >= 0) {
          const moduleNumber = lessonIndex + 1;
          try {
            const moduleRes = await getModuleProgress(key, moduleNumber);
            if (moduleRes.success && moduleRes.data) {
              setModuleProgress(prev => ({
                ...prev,
                [moduleNumber]: moduleRes.data.moduleProgress?.progress || 0
              }));
            }
          } catch (error) {
            console.error(`Error refreshing progress for module ${moduleNumber}:`, error);
          }
        }
      }
    } catch (e) {
      // Optionally show error
    }
  };

  // Function to refresh module progress
  const refreshModuleProgress = async (moduleNumber?: number) => {
    if (!user?.id || !data) return;

    try {
      if (moduleNumber) {
        // Refresh specific module
        const moduleRes = await getModuleProgress(key, moduleNumber);
        if (moduleRes.success && moduleRes.data) {
          setModuleProgress(prev => ({
            ...prev,
            [moduleNumber]: moduleRes.data.moduleProgress?.progress || 0
          }));
        }
      } else {
        // Trigger full refresh
        setRefreshTrigger(prev => prev + 1);
      }

      // Also refresh overall progress
      const res = await getLessonProgress(key);
      if (res.success && res.data) {
        setProgress(res.data.progress || 0);
        setCompletedLessons((res.data.completedLessons || []).map((l: any) => l.lessonId));
      }
    } catch (error) {
      console.error('Error refreshing progress:', error);
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
        courseId={key}
        moduleProgress={moduleProgress}
        onRefreshProgress={refreshModuleProgress}
      />
    </View>
  );
}
