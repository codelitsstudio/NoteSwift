// app/Chapter/[chapterDetail].tsx - Chapter Detail Page
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import ChapterDetailCard from "./ChapterDetail/ChapterDetailCard";
import { courses, Module } from "../../utils/courseData";
import FooterNav from "./ChapterDetail/FooterNav";
import { updateModuleProgress, getModuleProgress } from "../../api/lessonProgress";
import { useAuthStore } from "../../stores/authStore";

export default function ChapterDetailPage() {
  const router = useRouter();
  const { chapterDetail, courseId, subjectId } = useLocalSearchParams(); // chapterDetail can be moduleId or subjectId
  const lesson = chapterDetail; // For backward compatibility
  const { user } = useAuthStore();

  console.log('🔍 [chapterDetail].tsx DEBUG:', {
    receivedChapterDetail: chapterDetail,
    receivedLesson: lesson,
    receivedCourseId: courseId,
    receivedSubjectId: subjectId,
  });

  // Check if chapterDetail is actually a subject ID (wrong navigation)
  const isSubjectId = chapterDetail && typeof chapterDetail === 'string' && 
                     chapterDetail.includes('-') && !chapterDetail.includes('-module-');
  
  // If it's a subject ID, find the subject and show subject page
  if (isSubjectId) {
    console.log('📚 Treating chapterDetail as subject ID:', chapterDetail);
    
    // Find the subject from courseData
    let subjectData;
    for (const courseKey in courses) {
      const course = courses[courseKey];
      subjectData = course.subjects.find(s => s.id === chapterDetail);
      if (subjectData) break;
    }
    
    if (subjectData) {
      // Import ChapterTabs here to avoid circular imports
      const ChapterTabs = require('./ChapterTabs').default;
      
      return (
        <View className="flex-1 bg-[#FAFAFA]">
          <View className="bg-white p-4">
            <Text className="text-xl font-bold">{subjectData.name}</Text>
            <Text className="text-gray-600 mt-2">{subjectData.description}</Text>
          </View>
          
          <ChapterTabs
            data={subjectData}
            progress={0}
            completedLessons={[]}
            onLessonProgress={() => {}}
            loading={false}
            courseId={subjectData.id}
            moduleProgress={{}}
            onRefreshProgress={() => {}}
          />
        </View>
      );
    }
  }

  // Find the chapter (module) from courseData
  let chapterData: Module | undefined;
  let foundSubject;
  for (const courseKey in courses) {
    const course = courses[courseKey];
    foundSubject = course.subjects.find(s => s.id === subjectId);
    if (foundSubject) {
      console.log('📚 Found subject:', foundSubject.name, 'with modules:', foundSubject.modules.map(m => m.id));
      chapterData = foundSubject.modules.find(m => m.id === lesson);
      console.log('🎯 Looking for module:', lesson, 'Found:', !!chapterData);
      break;
    }
  }

  const data = chapterData;
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

  const handleVideoCompleted = useCallback(async () => {
    if (!courseId || !user?.id) return;
    
    try {
      // Module 1 VIDEO completion (separate from notes completion)
      await updateModuleProgress(courseId as string, 1, true);
      setVideoCompleted(true);
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  }, [courseId, user?.id]);

  const handleVideoCompletionStatusChange = useCallback((completed: boolean) => {
    // Update local state when video completion status changes
    setVideoCompleted(completed);
  }, []);

  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-600 text-base">Chapter not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

return (
  <View className="flex-1 bg-gray-100"> 
    <SafeAreaView className="flex-1">
      <ChapterDetailCard
        chapter={data}
          onPrevious={() => router.back()}
          onBack={() => router.back()}
          onNext={() => {
            /* navigation to next module */
          }}
          onVideoCompleted={handleVideoCompleted}
          onVideoCompletionStatusChange={handleVideoCompletionStatusChange}
          videoCompleted={videoCompleted}
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