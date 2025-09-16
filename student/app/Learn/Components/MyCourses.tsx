import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../../stores/authStore';
import { useCourseStore } from '../../../stores/courseStore';

const OngoingCourseCard = ({ item, enrollment }: { item: any, enrollment?: any }) => {
  const router = useRouter();
  // Use special chapter key for featured course
  let chapterParam = item.chapterKey || item.chapter || item._id || item.id;
  if (item.title === "Learn How To Actually Study Before It’s Too Late" || item.isFeatured) {
    chapterParam = "learn-how-to-actually-study-before-it's-too-late";
  }

  // Use backend-calculated overall progress as single source of truth
  let progress = 0;
  if (typeof enrollment?.progress === 'number' && !isNaN(enrollment.progress)) {
    progress = Math.round(enrollment.progress);
  } else {
    progress = 0;
  }
  console.log('Unified course progress:', progress);

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-2 mb-4 border border-gray-200"
      onPress={() => router.push({ pathname: '/Learn/[chapter]', params: { chapter: chapterParam } })}
    >
      <View className="flex-row">
        <Image source={{ uri: item.image || 'https://i.postimg.cc/dVtJL1yd/Screenshot-2025-0wada9-15-034336.png' }} className="w-32 h-34 rounded-2xl" />
        <View className="flex-1 ml-3">
          <View className="flex-row justify-between items-center">
            {(item.title === 'Learn How To Actually Study Before It\'s Too Late' || item.isFeatured) ? (
              <View className="flex-row items-center justify-center bg-blue-100 px-2 py-1 rounded-full">
                <MaterialIcons name="star" size={16} color="#3B82F6" style={{ marginRight: 4 }} />
                <Text className="text-xs text-blue-600 font-semibold">Featured</Text>
              </View>
            ) : (
              <Text className="text-xs text-customBlue bg-customBlue/10 px-2 py-1 rounded-full font-semibold">
                {item.subject || item.category || 'General'}
              </Text>
            )}
            <View className="flex-row items-center mr-1">
              <Text className="text-xs text-customBlue font-semibold ">Continue</Text>
              <MaterialIcons name="arrow-forward-ios" size={10} color="#0072d2" />
            </View>
          </View>
          <Text className="text-base font-bold text-black my-1">{item.title}</Text>
          <Text className="text-xs text-gray-500">{item.description || item.summary || 'No description.'}</Text>
          {/* Progress bar shows progress from backend */}
          <View className="flex-row items-center mt-2 mr-2">
            <View className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
              <View className="h-2 bg-customBlue rounded-full" style={{ width: `${progress}%` }} />
            </View>
            <Text className="text-xs font-semibold text-customBlue">{progress}%</Text>
          </View>
          {/* Show special badge for featured course */}
          {(item.title === 'Learn How To Actually Study Before It\'s Too Late' || item.isFeatured) && (
            <View className="flex-row items-center mt-1">
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MyCourses = () => {
  const { user } = useAuthStore();
  const { enrolledCourses, enrollments, fetchUserEnrollments, fetchAllCourses, courses, is_loading, featuredCourse, fetchFeaturedCourse } = useCourseStore();

  useEffect(() => {
    if (user?.id) {
      console.log('🔄 MyCourses: Initializing for user:', user.id);
      fetchUserEnrollments(user.id);
      fetchAllCourses();
      fetchFeaturedCourse();
    }
  }, [user?.id]);

  // Refresh enrollments when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        fetchUserEnrollments(user.id);
      }
    }, [user?.id])
  );

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('📊 MyCourses State Update:', {
      userId: user?.id,
      enrolledCoursesCount: enrolledCourses.length,
      enrolledCourses: enrolledCourses,
      featuredCourseId: featuredCourse?.id || featuredCourse?._id,
      featuredCourseTitle: featuredCourse?.title,
      coursesCount: courses?.length || 0,
      isLoading: is_loading
    });
  }, [user?.id, enrolledCourses, featuredCourse, courses, is_loading]);

  // Get all enrolled course IDs
  let allEnrolledIds = [...enrolledCourses];
  
  // Include featured course if user is enrolled in it
  if (featuredCourse) {
    const featId = featuredCourse.id || featuredCourse._id;
    console.log('🎯 Featured course check:', {
      featuredId: featId,
      featuredTitle: featuredCourse.title,
      enrolledCourses: enrolledCourses,
      isEnrolled: enrolledCourses.includes(featId)
    });
    
    if (enrolledCourses.includes(featId)) {
      console.log('✅ User is enrolled in featured course, adding to enrolled IDs');
      allEnrolledIds.push(featId);
    } else {
      console.log('❌ User not enrolled in featured course');
    }
  }

  // Filter courses to only show enrolled ones
  let ongoingCourses = courses && Array.isArray(courses)
    ? courses.filter(c => {
        const courseId = c.id || c._id;
        const isEnrolled = allEnrolledIds.includes(courseId);
        console.log(`📋 Course "${c.title}" (ID: ${courseId}) - Enrolled: ${isEnrolled}`);
        return isEnrolled;
      })
    : [];

  // If user is enrolled ONLY in the featured course, ensure it appears
  if (featuredCourse) {
    const featId = featuredCourse.id || featuredCourse._id;
    const isUserEnrolledInFeatured = enrolledCourses.includes(featId);
    const featuredAlreadyIncluded = ongoingCourses.some(c => (c.id || c._id) === featId);
    if (isUserEnrolledInFeatured && !featuredAlreadyIncluded) {
      ongoingCourses = [featuredCourse];
    }
  }

  console.log('🎉 Final ongoing courses:', ongoingCourses.map(c => ({ title: c.title, id: c.id || c._id, isFeatured: c.isFeatured })));

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 5 }}
      >
        <View className="px-0 mt-8">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-[1.3rem] font-bold text-gray-900">Ongoing Courses</Text>
          </View>
          {ongoingCourses.length === 0 ? (
            <View className="flex-1 justify-center items-center mb-4 mt-6">
              <Image
                source={require('../../../assets/images/ongoing-courses.gif')}
                style={{ width: 180, height: 180, marginBottom: 16 }}
              />
              <Text className="text-lg font-semibold text-gray-800">
                No ongoing courses yet.
              </Text>
              <Text className="text-sm text-gray-500 mt-1 text-center px-4">
                Please Enroll to get started!
              </Text>
            </View>
          ) : (
            ongoingCourses.map(item => {
              const courseId = item.id || item._id;
              const enrollment = enrollments.find(e => {
                const enrollmentCourseId = typeof e.courseId === 'string' ? e.courseId : e.courseId._id || e.courseId.id;
                return enrollmentCourseId === courseId;
              });
              return <OngoingCourseCard key={courseId} item={item} enrollment={enrollment} />;
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyCourses;