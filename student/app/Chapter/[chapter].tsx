import React, { useState } from "react";
import { useLocalSearchParams, useRouter , useFocusEffect } from "expo-router";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderFifth from "../../components/Headers/HeaderFifth";
import { courses, Subject } from "../../utils/courseData";
import ChapterTabs from "./ChapterTabs";
import { getLessonProgress, getModuleProgress, updateModuleProgress } from "../../api/lessonProgress";
import { useAuthStore } from "../../stores/authStore";

export default function SubjectPage() {
  const router = useRouter();
  const { chapter, courseKey } = useLocalSearchParams(); // chapter is subjectId
  const subjectId = String(chapter);
  
  // Find the subject from courseData
  let subjectData: Subject | undefined;
  const activeCourseKey = courseKey ? String(courseKey) : 'course-1'; // Default to course-1
  const course = courses[activeCourseKey];
  
  console.log('🔍 [chapter].tsx DEBUG:', {
    receivedChapter: chapter,
    receivedCourseKey: courseKey,
    subjectId,
    activeCourseKey,
    courseExists: !!course,
    courseTitle: course?.title,
    availableSubjectIds: course?.subjects.map(s => s.id),
  });
  
  if (course) {
    subjectData = course.subjects.find(s => s.id === subjectId);
    console.log('📚 Found subject:', subjectData ? subjectData.name : 'NOT FOUND');
  }
  
  const data = subjectData;
  // Use subject ID as courseId for backend API calls (maintaining backward compatibility)
  const courseId: string = data?.id ?? "";
  const { user } = useAuthStore();

  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [moduleProgress, setModuleProgress] = useState<{[key: number]: number}>({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      // Refresh progress when component comes back into focus
      const refreshOnFocus = async () => {
        // Add a small delay to ensure backend has finished saving
        setTimeout(async () => {
          if (!user?.id || !courseId) return;

          try {
            setLoading(true);

            // Get module progress for this subject
            const subjectIndex = course?.subjects.findIndex(s => s.id === subjectId) ?? 0;
            const chapterNumber = subjectIndex + 1;
            const moduleRes = await getModuleProgress(courseId, chapterNumber);
            if (moduleRes.success && moduleRes.data && typeof moduleRes.data.moduleProgress?.progress === 'number' && !isNaN(moduleRes.data.moduleProgress.progress)) {
              setProgress(Math.round(moduleRes.data.moduleProgress.progress));
            } else {
              setProgress(0);
            }

            // Get progress for all modules in this subject
            const moduleProgressData: {[key: number]: number} = {};
            if (data?.modules) {
              for (let i = 0; i < data.modules.length; i++) {
                const moduleNumber = chapterNumber + i; // Module numbers start from subject index
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
    }, [courseId, data?.modules, subjectId, user?.id, course, activeCourseKey])
  );

  // Handler to update progress when a module is started/completed
  const handleLessonProgress = async (lessonId: string, completed: boolean) => {
    if (!user?.id || !data) return;
    try {
      // Calculate correct module number based on subject
      const subjectIndex = course?.subjects.findIndex(s => s.id === subjectId) ?? 0;
      const chapterNumber = subjectIndex + 1;
      const lessonIndex = data.modules?.findIndex(module => module.id === lessonId) ?? -1;
      const moduleNumber = chapterNumber + lessonIndex; // Module numbers start from chapter number

      // Update module progress instead of overall lesson progress
      const res = await updateModuleProgress(courseId, moduleNumber, undefined, undefined);
      if (res.success && res.data) {
        // Update the main progress if this is the first module
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
        // Trigger full refresh
        const subjectIndex = course?.subjects.findIndex(s => s.id === subjectId) ?? 0;
        const chapterNumber = subjectIndex + 1;
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
    console.error('❌ SUBJECT NOT FOUND!', {
      subjectId,
      activeCourseKey,
      availableSubjects: course?.subjects.map(s => ({ id: s.id, name: s.name }))
    });
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAFAFA]" edges={['top', 'bottom']}>
        <Text className="text-gray-600">Subject not found.</Text>
        <Text className="text-xs text-gray-400 mt-2">Looking for: {subjectId}</Text>
        <Text className="text-xs text-gray-400">Course: {activeCourseKey}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      <HeaderFifth title={data.name} onBack={() => router.back()} />

      {/* Tabs + content */}
  <View style={{ paddingTop: 8 }}>
  {(() => {
        console.log('🎯 [chapter].tsx rendering ChapterTabs with data:', {
          subjectId: data.id,
          subjectName: data.name,
          modulesCount: data.modules?.length,
          firstModuleId: data.modules?.[0]?.id,
          firstModuleTitle: data.modules?.[0]?.title
        });
        return (
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
        );
      })()}
      </View>
    </SafeAreaView>
  );
}