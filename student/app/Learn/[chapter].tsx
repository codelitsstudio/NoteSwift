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

  useFocusEffect(() => {
    // Refresh progress when component comes back into focus
    // This handles the case when user navigates back from notes
    const refreshOnFocus = async () => {
      if (!user?.id || !courseId) return;

      try {
        setLoading(true);

        // Get module progress for this chapter (module 1 for chapter-1, module 2 for chapter-2, etc.)
        const chapterNumber = parseInt(key.replace('chapter-', '')) || 1;
        const moduleRes = await getModuleProgress(courseId, chapterNumber);
        if (moduleRes.success && moduleRes.data) {
          setProgress(moduleRes.data.moduleProgress?.progress || 0);
        }

        // Get progress for all modules in this chapter
        // Each chapter has its own module sequence starting from 1
        const moduleProgressData: {[key: number]: number} = {};
        if (data?.lessons) {
          for (let i = 0; i < data.lessons.length; i++) {
            // For chapter-1: modules 1, 2, 3, 4, 5
            // For chapter-2: modules 1, 2, 3, 4, 5 (NOT 2, 3, 4, 5, 6)
            const moduleNumber = i + 1; // Each chapter starts with module 1
            try {
              const res = await getModuleProgress(courseId, moduleNumber);
              if (res.success && res.data) {
                moduleProgressData[moduleNumber] = res.data.moduleProgress?.progress || 0;
              }
            } catch (error) {
              console.error(`Error fetching progress for module ${moduleNumber}:`, error);
            }
          }
        }
        setModuleProgress(moduleProgressData);

        // Calculate completed lessons from module progress
        // A lesson is "completed" if its corresponding module has progress > 0
        const calculatedCompletedLessons: string[] = [];
        if (data?.lessons) {
          data.lessons.forEach((lesson, index) => {
            const moduleNumber = index + 1;
            if (moduleProgressData[moduleNumber] && moduleProgressData[moduleNumber] > 0) {
              calculatedCompletedLessons.push(lesson.id);
            }
          });
        }
        setCompletedLessons(calculatedCompletedLessons);
      } catch (error) {
        console.error('Error refreshing progress on focus:', error);
      } finally {
        // Always set loading to false after fetch attempt
        setLoading(false);
      }
    };    refreshOnFocus();
  });

  // Handler to update progress when a lesson is started (not completed)
  const handleLessonProgress = async (lessonId: string, started: boolean) => {
    if (!user?.id || !data) return;
    try {
      // For now, just ensure the module exists in our progress tracking
      // Actual completion will be handled by NotesAndReadable component
      if (started) {
        // Update completed lessons to include this lesson (for UI purposes)
        const updatedCompletedLessons = [...completedLessons];
        if (!updatedCompletedLessons.includes(lessonId)) {
          updatedCompletedLessons.push(lessonId);
        }
        setCompletedLessons(updatedCompletedLessons);
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
        // Refresh the first module for this chapter
        const moduleRes = await getModuleProgress(courseId, 1);
        if (moduleRes.success && moduleRes.data) {
          setProgress(moduleRes.data.moduleProgress?.progress || 0);
        }
      }

      // Calculate completed lessons from current module progress
      const calculatedCompletedLessons: string[] = [];
      if (data?.lessons) {
        data.lessons.forEach((lesson, index) => {
          const moduleNumber = index + 1;
          // Check if this module has progress
          const currentModuleProgress = moduleProgress[moduleNumber] || 0;
          if (currentModuleProgress > 0) {
            calculatedCompletedLessons.push(lesson.id);
          }
        });
      }
      setCompletedLessons(calculatedCompletedLessons);
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
