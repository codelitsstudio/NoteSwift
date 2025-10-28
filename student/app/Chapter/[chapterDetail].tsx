// app/Chapter/[chapterDetail].tsx - Chapter Detail Page
import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import ChapterDetailCard from "./ChapterDetail/ChapterDetailCard";
import FooterNav from "./ChapterDetail/FooterNav";
import { useCourseStore } from "../../stores/courseStore";

export default function ChapterDetailPage() {
  const router = useRouter();
  const { chapterDetail, courseId, subjectId } = useLocalSearchParams(); // chapterDetail can be moduleId or subjectId
  const lesson = chapterDetail; // For backward compatibility
  const { currentSubjectContent, subjectContentLoading, subjectContentError, fetchSubjectContent } = useCourseStore();

  console.log('🔍 [chapterDetail].tsx DEBUG:', {
    receivedChapterDetail: chapterDetail,
    receivedLesson: lesson,
    receivedCourseId: courseId,
    receivedSubjectId: subjectId,
  });

  // Fetch subject content if not already loaded
  useEffect(() => {
    if (courseId && subjectId && !currentSubjectContent) {
      console.log('📚 Fetching subject content for chapter detail:', { courseId, subjectId });
      fetchSubjectContent(courseId as string, subjectId as string);
    }
  }, [courseId, subjectId, currentSubjectContent, fetchSubjectContent]);

  // Find the module from the current subject content
  let chapterData: any = null;
  let moduleNumber: number = 1;
  if (currentSubjectContent && currentSubjectContent.modules) {
    // Extract module number from lessonId (e.g., "module-1" -> 1)
    const moduleMatch = lesson?.toString().match(/module-(\d+)/);
    moduleNumber = moduleMatch ? parseInt(moduleMatch[1]) : 1;
    
    if (moduleNumber) {
      chapterData = currentSubjectContent.modules.find((module: any) => module.moduleNumber === moduleNumber);
      console.log('🎯 Found module by number:', moduleNumber, 'Module data:', chapterData);
    }
    
    // Fallback: try to find by id
    if (!chapterData) {
      chapterData = currentSubjectContent.modules.find((module: any) => module.id === lesson);
      console.log('🎯 Found module by id:', lesson, 'Module data:', chapterData);
    }
  }

  // Transform the module data to match the expected format
  const data = chapterData ? {
    id: `module-${chapterData.moduleNumber}`,
    title: chapterData.moduleName || `Module ${chapterData.moduleNumber}`,
    subtitle: chapterData.description || 'Module content',
    description: chapterData.description || 'Module description',
    hasVideo: chapterData.hasVideo || (chapterData.videos && chapterData.videos.length > 0) || false,
    hasNotes: chapterData.hasNotes || false,
    videos: chapterData.videos || (chapterData.videoUrl ? [{
      url: chapterData.videoUrl,
      title: chapterData.videoTitle || 'Video',
      duration: chapterData.videoDuration,
      uploadedAt: chapterData.videoUploadedAt
    }] : []),
    videoUrl: chapterData.videos && chapterData.videos.length > 1 ? null : (chapterData.videoUrl || (chapterData.videos && chapterData.videos.length > 0 ? chapterData.videos[0].url : null)),
    notesUrl: chapterData.notesUrl || null,
    videoTitle: chapterData.videos && chapterData.videos.length > 1 ? null : (chapterData.videoTitle || (chapterData.videos && chapterData.videos.length > 0 ? chapterData.videos[0].title : null)),
    notesTitle: chapterData.notesTitle || null,
    teacherId: currentSubjectContent?.teacherId || null,
    teacher: currentSubjectContent?.teacherName || null,
    tags: [
      (chapterData.hasVideo || (chapterData.videos && chapterData.videos.length > 0)) ? { 
        type: 'video' as const, 
        label: 'Videos', 
        count: chapterData.videos ? chapterData.videos.length : (chapterData.videoUrl ? 1 : 1) 
      } : null,
      chapterData.hasNotes ? { type: 'notes' as const, label: 'Notes', count: 1 } : null,
      chapterData.hasLiveClass ? { type: 'live' as const, label: 'Live Class', count: 1 } : null
    ].filter((tag): tag is { type: "video" | "notes" | "live"; label: string; count: number } => tag !== null)
  } : null;

  console.log('🎯 Chapter data being passed to component:', {
    teacher: data?.teacher,
    currentSubjectContent: {
      teacherName: currentSubjectContent?.teacherName
    }
  });

  // Show loading state while fetching subject content
  if (subjectContentLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-600 text-base">Loading chapter details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if subject content failed to load
  if (subjectContentError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-600 text-base">Failed to load chapter details.</Text>
          <Text className="text-xs text-red-400 mt-2">Error: {subjectContentError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-600 text-base">Chapter details not found.</Text>
          <Text className="text-xs text-gray-400 mt-2">Module: {lesson}</Text>
          <Text className="text-xs text-gray-400">Subject: {subjectId}</Text>
          <Text className="text-xs text-gray-400">Course: {courseId}</Text>
        </View>
      </SafeAreaView>
    );
  }

return (
  <View className="flex-1 bg-gray-100"> 
    <SafeAreaView className="flex-1">
      <ChapterDetailCard
        chapter={data}
        courseId={courseId as string}
        subjectName={subjectId as string}
        moduleNumber={moduleNumber}
          onPrevious={() => router.back()}
          onBack={() => router.back()}
          onNext={() => {
            /* navigation to next module */
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