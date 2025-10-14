import React, { useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../../stores/authStore';
import { useCourseStore } from '../../../stores/courseStore';

// Demo data for UI testing
const demoCourses = [
  {
    id: 'demo-1',
    _id: 'demo-1',
    title: 'Grade 11 Package',
    description: 'Comprehensive package for +2 Science students',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500',
    category: '+2 Science',
    subjects: [{ name: 'Physics' }, { name: 'Chemistry' }, { name: 'Mathematics' }],
    isFeatured: false,
  },
  {
    id: 'demo-2',
    _id: 'demo-2',
    title: 'Grade 12 Package',
    description: 'Advanced topics for board exam preparation',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500',
    category: '+2 Management',
    subjects: [{ name: 'Physics' }, { name: 'Chemistry' }, { name: 'Mathematics' }],
    isFeatured: false,
  },
  {
    id: 'demo-3',
    _id: 'demo-3',
    title: 'Grade 10 Package',
    description: 'Build strong fundamentals for higher grades',
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500',
    category: 'SEE',
    subjects: [{ name: 'Science' }, { name: 'Mathematics' }, { name: 'Social Studies' }],
    isFeatured: false,
  },
];

// Demo enrollments for progress bars
const demoEnrollments = [
  { courseId: 'demo-1', progress: 65 },
  { courseId: 'demo-2', progress: 42 },
  { courseId: 'demo-3', progress: 28 },
];

const OngoingCourseCard = ({ item, enrollment, isLast }: { item: any, enrollment?: any, isLast?: boolean }) => {
  const router = useRouter();
  
  // Use backend-calculated overall progress as single source of truth
  const progress = typeof enrollment?.progress === 'number' && !isNaN(enrollment.progress)
    ? Math.round(enrollment.progress)
    : 0;

  const handlePress = () => {
    // Check if this is a featured course - navigate directly to chapter
    if (item.title === "Learn How To Actually Study Before It's Too Late" || item.isFeatured) {
      const chapterParam = "learn-how-to-actually-study-before-it's-too-late";
      router.push({ pathname: '/Learn/[chapter]', params: { chapter: chapterParam } });
    } else {
      // For grade packages, navigate to subject page
      const packageId = item.id || item._id;
      router.push({ pathname: '/Learn/SubjectPage', params: { packageId } });
    }
  };

  return (
    <View className="mb-1 items-center">
      {/* Course Title & Badge - Outside the card */}
      <View className="mb-1.5 w-full">
        {(item.title === 'Learn How To Actually Study Before It\'s Too Late' || item.isFeatured) ? (
          <View className="flex-row items-center mb-1">
            <MaterialIcons name="star" size={14} color="#3B82F6" />
            <Text className="ml-1 text-xs text-blue-600 font-semibold">Featured</Text>
          </View>
        ) : (
          <Text className="text-xs text-gray-500 mb-1">{item.category || 'General'}</Text>
        )}
        
        <Text className="text-base font-bold text-gray-900 mb-1">
          {item.title}
        </Text>
        
        <Text className="text-xs text-gray-500" numberOfLines={1}>
          {item.description || item.summary || 'Professional Certificate'}
        </Text>
      </View>

      {/* Card with current position and progress */}
      <TouchableOpacity
        className="bg-white rounded-2xl pt-4 px-4 pb-4 border border-gray-200 w-full"
        activeOpacity={0.85}
        onPress={handlePress}
      >
        {/* Current Subject/Chapter */}
        <Text className="text-gray-900 text-base font-semibold mb-1">
          {item.subjects?.[0]?.name || 'Getting Started'}
        </Text>
        
        {/* Progress info */}
        <Text className="text-gray-500 text-xs mb-3">
          Course {item.subjects?.length || 1} of {item.subjects?.length || 9} • {progress}% Completed
        </Text>
        
        {/* Progress bar */}
        <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <View className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
        </View>
        
        {/* Current lesson/topic info */}
        <View className="mt-3 pt-3 border-t border-gray-200">
          <Text className="text-gray-900 text-xs font-medium mb-1">
            Continue Learning
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialIcons name="play-circle-outline" size={14} color="#9CA3AF" />
              <Text className="text-gray-500 text-xs ml-1">Next Lesson</Text>
            </View>
            <View className="bg-blue-600 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">Continue</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
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
  }, [user?.id, fetchUserEnrollments, fetchAllCourses, fetchFeaturedCourse]);

  // Refresh enrollments when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        fetchUserEnrollments(user.id);
      }
    }, [user?.id, fetchUserEnrollments])
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

  // Use demo data for UI testing if no real courses
  const hasRealCourses = ongoingCourses && ongoingCourses.length > 0;
  const displayCourses = hasRealCourses ? ongoingCourses : demoCourses;
  const displayEnrollments = hasRealCourses ? enrollments : demoEnrollments;

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-8">
          {/* Header - Leftmost */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">Ongoing Courses</Text>
          </View>
          
          {/* Cards - Slightly indented and centered */}
          {displayCourses && displayCourses.length > 0 ? (
            <>
              {displayCourses.map((item, index) => {
                const courseId = item.id || item._id;
                const enrollment = displayEnrollments.find(e => {
                  const enrollmentCourseId = typeof e.courseId === 'string' ? e.courseId : e.courseId?._id || e.courseId?.id || e.courseId;
                  return enrollmentCourseId === courseId;
                });
                const isLast = index === displayCourses.length - 1;
                return (
                  <React.Fragment key={courseId}>
                    <View className="px-3">
                      <OngoingCourseCard item={item} enrollment={enrollment} isLast={isLast} />
                    </View>
                    {/* Full-width Section Divider */}
                    {!isLast && (
                      <View className="flex-row items-center my-4">
                        <View className="flex-1 h-px bg-gray-300" />
                        <Text className="mx-3 text-xs text-gray-400 font-medium">•</Text>
                        <View className="flex-1 h-px bg-gray-300" />
                      </View>
                    )}
                  </React.Fragment>
                );
              })}
            </>
          ) : (
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
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyCourses;