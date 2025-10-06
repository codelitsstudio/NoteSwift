//learn/[chapter].tsx

import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text } from "react-native";
import HeaderFifth from "../../components/Headers/HeaderFifth";
import Icon from "react-native-vector-icons/MaterialIcons";
import { chapters } from "../../utils/chapterData";
import ChapterTabs from "../../components/Tabs/ChapterTabs";
import { getLessonProgress, updateLessonProgress, getModuleProgress, updateModuleProgress } from "../../api/lessonProgress";
import { useAuthStore } from "../../stores/authStore";
import { useFocusEffect } from "expo-router";

export default function ChapterPage() {
  const router = useRouter();
  const { chapter } = useLocalSearchParams(); // e.g. "chapter-1"
  const key = String(chapter).toLowerCase();
  const data = chapters[key];
  // Use MongoDB ObjectId for backend API calls
  const courseId: string = data?._id ?? "";
  const { user } = useAuthStore();

  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [moduleProgress, setModuleProgress] = useState<{[key: number]: number}>({});
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      // Refresh progress when component comes back into focus
      const refreshOnFocus = async () => {
        // Add a small delay to ensure backend has finished saving
        setTimeout(async () => {
          if (!user?.id || !courseId) return;

          try {
            setLoading(true);

            // Get module progress for this chapter (module 1 for chapter-1, module 2 for chapter-2, etc.)
            const chapterNumber = parseInt(key.replace('chapter-', '')) || 1;
            const moduleRes = await getModuleProgress(courseId, chapterNumber);
            if (moduleRes.success && moduleRes.data && typeof moduleRes.data.moduleProgress?.progress === 'number' && !isNaN(moduleRes.data.moduleProgress.progress)) {
              setProgress(Math.round(moduleRes.data.moduleProgress.progress));
            } else {
              setProgress(0);
            }

            // Get progress for all modules in this chapter
            const moduleProgressData: {[key: number]: number} = {};
            if (data?.lessons) {
              for (let i = 0; i < data.lessons.length; i++) {
                const moduleNumber = chapterNumber + i; // Module numbers start from chapter number
                try {
                  const res = await getModuleProgress(courseId, moduleNumber);
                  if (res.success && res.data) {
                    moduleProgressData[moduleNumber] = (typeof res.data.moduleProgress?.progress === 'number' && !isNaN(res.data.moduleProgress.progress)) ? Math.round(res.data.moduleProgress.progress) : 0;
                  }
                } catch (error) {
                  console.error(`Error fetching progress for module ${moduleNumber}:`, error);
                }
              }
            }
            setModuleProgress(moduleProgressData);

            // Get completed lessons from overall progress
            const res = await getLessonProgress(courseId);
            if (res.success && res.data) {
              setCompletedLessons((res.data.completedLessons || []).map((l: any) => l.lessonId));
            }
          } catch (error) {
            console.error('Error refreshing progress on focus:', error);
          } finally {
            setLoading(false);
          }
        }, 1000); // 1 second delay
      };
      refreshOnFocus();
    }, [])
  );

  // Handler to update progress when a lesson is started/completed
  const handleLessonProgress = async (lessonId: string, completed: boolean) => {
    if (!user?.id || !data) return;
    try {
      // Calculate correct module number based on chapter
      const chapterNumber = parseInt(key.replace('chapter-', '')) || 1;
      const lessonIndex = data.lessons?.findIndex(lesson => lesson.id === lessonId) ?? -1;
      const moduleNumber = chapterNumber + lessonIndex; // Module numbers start from chapter number

      // Update module progress instead of overall lesson progress
      const res = await updateModuleProgress(courseId, moduleNumber, undefined, undefined);
      if (res.success && res.data) {
        // Update the main progress if this is the first lesson (module 1 for chapter-1, etc.)
        if (lessonIndex === 0) {
          setProgress(res.data.moduleProgress?.progress || 0);
        }
        setCompletedLessons((res.data.completedLessons || []).map((l: any) => l.lessonId));

        // Refresh module progress after update
        const moduleRes = await getModuleProgress(courseId, moduleNumber);
        if (moduleRes.success && moduleRes.data) {
          setModuleProgress(prev => ({
            ...prev,
            [moduleNumber]: (typeof moduleRes.data.moduleProgress?.progress === 'number' && !isNaN(moduleRes.data.moduleProgress.progress)) ? Math.round(moduleRes.data.moduleProgress.progress) : 0
          }));
        }
      }
    } catch (e) {
      console.error('Error updating lesson progress:', e);
    }
  };

  // Function to refresh module progress
  const refreshModuleProgress = async (moduleNumber?: number) => {
    if (!user?.id || !data) return;

    try {
      if (moduleNumber) {
        // Refresh specific module
        const moduleRes = await getModuleProgress(courseId, moduleNumber);
        if (moduleRes.success && moduleRes.data) {
          setModuleProgress(prev => ({
            ...prev,
            [moduleNumber]: moduleRes.data.moduleProgress?.progress || 0
          }));
        }
      } else {
        // Trigger full refresh by calling refreshOnFocus
        const chapterNumber = parseInt(key.replace('chapter-', '')) || 1;
        const moduleRes = await getModuleProgress(courseId, chapterNumber);
        if (moduleRes.success && moduleRes.data && typeof moduleRes.data.moduleProgress?.progress === 'number' && !isNaN(moduleRes.data.moduleProgress.progress)) {
          setProgress(Math.round(moduleRes.data.moduleProgress.progress));
        } else {
          setProgress(0);
        }
      }

      // Get completed lessons from overall progress
      const res = await getLessonProgress(courseId);
      if (res.success && res.data) {
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
        courseId={courseId}
        moduleProgress={moduleProgress}
        onRefreshProgress={refreshModuleProgress}
      />
    </View>
  );
}
