import React, { useState, useEffect, useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderFifth from "../../components/Headers/HeaderFifth";
import ChapterTabs from "../Chapter/ChapterTabs";
import { useCourseStore } from "../../stores/courseStore";
import api from "../../api/axios";

export default function SubjectPage() {
  const router = useRouter();
  const { subject, courseKey } = useLocalSearchParams(); // subject is subjectId
  const subjectId = decodeURIComponent(String(subject));
  const { selectedCourse, courses, currentSubjectContent, subjectContentLoading, subjectContentError, fetchSubjectContent: fetchSubjectContentFromStore } = useCourseStore();
  const [courseTeachers, setCourseTeachers] = useState<any[]>([]);
  
  // Debug selectedCourse state
  console.log('🎯 [subject].tsx INITIAL STATE:', {
    subjectId: subjectId,
    courseKey: courseKey,
    selectedCourseExists: !!selectedCourse,
    selectedCourseTitle: selectedCourse?.title,
    selectedCourseSubjectsCount: selectedCourse?.subjects?.length,
    coursesCount: courses.length,
    coursesTitles: courses.map(c => c.title)
  });
  
  // Function to fetch and set subject content
  const fetchSubjectContent = useCallback(async () => {
    try {
      // Use course ID for API call - try selectedCourse first, then courseKey
      const courseId = selectedCourse?._id || selectedCourse?.id || 
        (courseKey ? String(courseKey) : "");
      
      if (!courseId) {
        throw new Error("No course ID available");
      }
      
      console.log('📚 Fetching subject content:', { courseId, subjectId });
      await fetchSubjectContentFromStore(courseId, subjectId);
    } catch (error) {
      console.error('❌ Error fetching subject content:', error);
    }
  }, [selectedCourse, courseKey, subjectId, fetchSubjectContentFromStore]);
  
  // Fetch subject content when component mounts or when data changes
  useEffect(() => {
    fetchSubjectContent();
  }, [subjectId, courseKey, selectedCourse, fetchSubjectContent]);
  
  // Fetch course teachers
  useEffect(() => {
    const fetchCourseTeachers = async () => {
      if (!selectedCourse?._id && !selectedCourse?.id) return;

      try {
        const courseId = selectedCourse._id || selectedCourse.id;
        console.log('👨‍🏫 Fetching teachers for course:', courseId);
        
        const response = await api.get(`/courses/${courseId}/teachers`);
        
        if (response.data.success) {
          setCourseTeachers(response.data.data.subjects || []);
          console.log('👨‍🏫 Course teachers loaded:', response.data.data.subjects?.length || 0);
        }
      } catch (error) {
        console.error('❌ Error fetching course teachers:', error);
        setCourseTeachers([]);
      }
    };

    fetchCourseTeachers();
  }, [selectedCourse]);
  
  const data = currentSubjectContent ? {
    id: currentSubjectContent.subjectName,
    _id: selectedCourse?._id || selectedCourse?.id || (courseKey ? String(courseKey) : ""),
    name: currentSubjectContent.subjectName,
    description: currentSubjectContent.description || 'Subject content and modules',
    duration: 'Duration not specified',
    modules: (currentSubjectContent.modules || []).map((module: any, index: number) => ({
      id: `module-${module.moduleNumber}`,
      title: module.moduleName || `Module ${module.moduleNumber}`,
      subtitle: module.description || 'Module content',
      description: module.description || 'Module description',
      hasVideo: module.hasVideo || false,
      hasNotes: module.hasNotes || false,
      videoUrl: module.videoUrl || null,
      notesUrl: module.notesUrl || null,
      videoTitle: module.videoTitle || null,
      notesTitle: module.notesTitle || null,
      tags: module.tags || [] // Use tags from backend response
    }))
  } : null;
  
  console.log('🔍 [subject].tsx - currentSubjectContent:', currentSubjectContent);
  console.log('🔍 [subject].tsx - transformed data:', data);
  console.log('🔍 [subject].tsx - data modules:', data?.modules);
  console.log('🔍 [subject].tsx - subjectContentLoading:', subjectContentLoading);
  console.log('🔍 [subject].tsx - subjectContentError:', subjectContentError);
  console.log('🔍 [subject].tsx - subjectContentLoading:', subjectContentLoading);
  console.log('🔍 [subject].tsx - subjectContentError:', subjectContentError);
  
  // Use course ID for backend API calls
  const finalCourseId: string = selectedCourse?._id || selectedCourse?.id || 
    (courseKey ? String(courseKey) : "");
  
  // Simple progress - always 0 for now
  const progress = 0;
  const completedLessons: string[] = [];
  const moduleProgress: {[key: number]: number} = {};
  // const loading = false;

  // Simple handlers - no progress tracking for now
  const handleLessonProgress = async (lessonId: string, completed: boolean) => {
    // TODO: Add progress tracking logic later
    console.log('Lesson progress update:', { lessonId, completed });
  };

  const refreshModuleProgress = async (moduleNumber?: number) => {
    // TODO: Add progress refresh logic later
    console.log('Refresh module progress:', { moduleNumber });
  };


  if (subjectContentLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAFAFA]" edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading subject content...</Text>
      </SafeAreaView>
    );
  }

  if (subjectContentError || !data) {
    console.error('❌ SUBJECT NOT FOUND!', {
      subjectId,
      subjectContentError,
      selectedCourseTitle: selectedCourse?.title,
      selectedCourseId: selectedCourse?.id || selectedCourse?._id,
      availableSubjects: selectedCourse?.subjects?.map(s => ({ name: s.name })),
      courseKey: courseKey,
      coursesCount: courses.length,
      coursesTitles: courses.map(c => c.title)
    });
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAFAFA]" edges={['top', 'bottom']}>
        <Text className="text-gray-600">Subject not found.</Text>
        <Text className="text-xs text-gray-400 mt-2">Looking for: {subjectId}</Text>
        <Text className="text-xs text-gray-400">Course: {selectedCourse?.title || 'None selected'}</Text>
        <Text className="text-xs text-gray-400">Course Key: {courseKey || 'None'}</Text>
        {subjectContentError && (
          <Text className="text-xs text-red-400 mt-2">Error: {subjectContentError}</Text>
        )}
        <Text className="text-xs text-gray-400">Available subjects: {selectedCourse?.subjects?.map(s => s.name).join(', ') || 'None'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      <HeaderFifth title={data.name} onBack={() => router.back()} />

      {/* Tabs + content */}
      <View style={{ flex: 1, paddingTop: 8 }}>
        <ChapterTabs
          data={data}
          progress={progress}
          completedLessons={completedLessons}
          onLessonProgress={handleLessonProgress}
          loading={subjectContentLoading}
          courseId={finalCourseId}
          moduleProgress={moduleProgress}
          onRefreshProgress={refreshModuleProgress}
          courseTeachers={courseTeachers}
          courseOfferedBy={selectedCourse?.offeredBy}
        />
      </View>
    </SafeAreaView>
  );
}