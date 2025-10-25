import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../../stores/authStore';
import { useCourseStore } from '../../../stores/courseStore';
import SubjectTabs from '../SubjectTabs';
import axios from '../../../api/axios';

const MyCourses = () => {
  const { user } = useAuthStore();
  const { selectedCourse, enrollments } = useCourseStore();
  const [courseTeachers, setCourseTeachers] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      console.log('🔄 MyCourses: Initializing for user:', user.id);
    }
  }, [user?.id]);

  // Fetch teachers for the selected course
  useEffect(() => {
    const fetchCourseTeachers = async () => {
      if (!selectedCourse?._id && !selectedCourse?.id) return;

      try {
        const courseId = selectedCourse._id || selectedCourse.id;
        console.log('👨‍🏫 Fetching teachers for course:', courseId);
        
        const response = await axios.get(`/courses/${courseId}/teachers`);
        
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

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🎯 MyCourses focused, selected course:', selectedCourse?.title);
    }, [selectedCourse])
  );

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('📊 MyCourses State Update:', {
      userId: user?.id,
      selectedCourseTitle: selectedCourse?.title,
      selectedCourseId: selectedCourse?.id || selectedCourse?._id,
      subjectsCount: selectedCourse?.subjects?.length || 0
    });
  }, [user?.id, selectedCourse]);

  // If no course is selected, show message
  if (!selectedCourse) {
    return (
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-8">
            <Text className="text-xl font-bold text-gray-900 mb-6">My Subjects</Text>
            <View className="flex-1 justify-center items-center mb-4 mt-6">
              <Image
                source={require('../../../assets/images/ongoing-courses.gif')}
                style={{ width: 180, height: 180, marginBottom: 16 }}
              />
              <Text className="text-lg font-semibold text-gray-800">
                No course selected
              </Text>
              <Text className="text-sm text-gray-500 mt-1 text-center px-4">
                Go to More page to select a course to start learning
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const subjects = selectedCourse.subjects || [];

  // Find enrollment for the selected course
  const selectedCourseEnrollment = enrollments.find(enrollment => {
    const courseId = typeof enrollment.courseId === 'string' 
      ? enrollment.courseId 
      : enrollment.courseId._id || enrollment.courseId.id || enrollment.courseId;
    const selectedId = selectedCourse?._id || selectedCourse?.id;
    return courseId === selectedId;
  });

  // Transform selectedCourse data to match SubjectTabs expected format
  const transformedPackageData = {
    _id: selectedCourse._id || selectedCourse.id,
    title: selectedCourse.title,
    description: selectedCourse.description || 'Course description',
    subjects: subjects.map((subject: any, index: number) => ({
      id: subject.name, // Use subject name as ID for navigation
      name: subject.name,
      subtitle: subject.description || 'Subject content',
      description: subject.description || 'Subject description and modules',
      duration: subject.duration || 'Duration not specified',
      teacher: 'Course Instructor', // Default teacher
      icon: 'school', // Default icon
      color: '#3B82F6', // Default color
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', // Default image
      modules: (subject.modules || []).map((module: any, moduleIndex: number) => ({
        id: `module-${moduleIndex + 1}`,
        title: module.name || `Module ${moduleIndex + 1}`,
        subtitle: module.description || 'Module content',
        description: module.description || 'Module description',
        imageUri: 'https://i.postimg.cc/9Fg6yxdf/course-1-thumbnail.jpg',
        teacher: 'Course Instructor',
        teacherAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        uploadDate: new Date().toLocaleDateString(),
        tags: [
          { type: 'video', label: 'Videos', count: 1 },
          { type: 'notes', label: 'Notes', count: 1 }
        ]
      })),
      totalLessons: subject.modules?.length || 1,
    }))
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-8">
          {/* Header - Leftmost */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">My Subjects</Text>
          </View>
          
          {/* Cards - Slightly indented and centered */}
          {subjects && subjects.length > 0 ? (
            <SubjectTabs 
              packageData={transformedPackageData} 
              courseKey={selectedCourse._id || selectedCourse.id}
              enrollment={selectedCourseEnrollment}
              courseOfferedBy={selectedCourse.offeredBy}
              courseTeachers={courseTeachers}
            />
          ) : (
              <View className="flex-1 justify-center items-center mb-4 mt-6">
                <Image
                  source={require('../../../assets/images/ongoing-courses.gif')}
                  style={{ width: 180, height: 180, marginBottom: 16 }}
                />
                <Text className="text-lg font-semibold text-gray-800">
                  No subjects available
                </Text>
                <Text className="text-sm text-gray-500 mt-1 text-center px-4">
                  This course doesn't have subjects configured yet
                </Text>
              </View>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyCourses;