import React, { useEffect, useState, useCallback } from 'react';
import { RefreshControl ,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';

import PrimaryNav from '../../components/Navigation/PrimaryNav';
import SearchBar from '../../components/InputFields/SearchBar';
import ActiveCourses from './Components/ActiveCourses';
import ModelQuestions from './Components/ModelQuestions';
import { OfflineScreen } from '../../components/Container/OfflineScreen';
import { useLearnStore } from '@/stores/learnStore';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useAuthStore } from '../../stores/authStore';
import { useCourseStore } from '../../stores/courseStore';
import LiveClasses, { hasLiveClasses } from './Components/LiveClasses';
import LiveClassJoinBottomSheet from './Components/LiveClassJoinBottomSheet';
import Skeleton from '../../components/Container/Skeleton';
import { useFocusEffect } from '@react-navigation/native';
import MyCourses from './Components/MyCourses';

// LearnPage Skeleton Component
const LearnPageSkeleton: React.FC = () => {
  return (
    <View className="px-6 pt-6 flex-1 bg-[#FAFAFA]">
      {/* Title Skeleton */}
      <Skeleton width={150} height={32} borderRadius={4} style={{ marginBottom: 24 }} />

      {/* SearchBar Skeleton */}
      <Skeleton width="100%" height={50} borderRadius={25} style={{ marginBottom: 20 }} />

      {/* MyCourses Skeleton */}
      <View className="mb-6">
        <Skeleton width={120} height={24} borderRadius={4} style={{ marginBottom: 12 }} />
        <View className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={100} borderRadius={12} />
          ))}
        </View>
      </View>

      {/* LiveClasses Skeleton */}
      <View className="mb-6">
        <Skeleton width={100} height={24} borderRadius={4} style={{ marginBottom: 12 }} />
        <View className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={80} borderRadius={12} />
          ))}
        </View>
      </View>

      {/* Upcoming Classes Section */}
      <View className="flex-row justify-between items-center mb-4">
        <Skeleton width={160} height={24} borderRadius={4} />
        <Skeleton width={80} height={20} borderRadius={4} />
      </View>

      {/* ActiveCourses Skeleton */}
      <View className="mb-6">
        <View className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={120} borderRadius={12} />
          ))}
        </View>
      </View>

      {/* Model Questions Section */}
      <View className="flex-row justify-between items-center mb-4">
        <Skeleton width={160} height={28} borderRadius={4} />
        <Skeleton width={80} height={20} borderRadius={4} />
      </View>

      {/* ModelQuestions Skeleton */}
      <View className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} width="100%" height={100} borderRadius={12} />
        ))}
      </View>
    </View>
  );
};

export default function HomePage() {
  // Network status monitoring
  const isOnline = useNetworkStatus();
  
  const [searchQuery, setSearchQuery] = useState('');
  const fetchFeed = useLearnStore(state=>state.fetchFeed);
  const { user } = useAuthStore();
  const { fetchUserEnrollments, fetchAllCourses, fetchFeaturedCourse, is_loading, selectedCourse, enrolledCourses, courses, selectCourse, userClearedSelection } = useCourseStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Bottom sheet state for live class join
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showJoinSheet, setShowJoinSheet] = useState(false);

  const handleJoinPress = (item: any) => {
    setSelectedClass(item);
    setShowJoinSheet(true);
  };

  useEffect(()=>{
    fetchFeed();
  }, [fetchFeed]);

  // Set loading state immediately when page is focused
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      // Start data fetching but don't wait for it
      const initializeLearnPage = async () => {
        try {
          await fetchFeed();
          if (user?.id) {
            await fetchUserEnrollments(user.id);
            await fetchAllCourses();
            await fetchFeaturedCourse();
          }
        } catch {
          // Handle error silently
        }
      };
      initializeLearnPage();

      // Set loading to false immediately for ultra-fast skeleton
      setIsLoading(false);
    }, [user?.id, fetchFeed, fetchUserEnrollments, fetchAllCourses, fetchFeaturedCourse])
  );

  // Auto-select first enrolled course if none selected AND user hasn't explicitly cleared selection
  useFocusEffect(
    useCallback(() => {
      const autoSelectCourse = () => {
        if (!selectedCourse && !userClearedSelection && enrolledCourses.length > 0 && courses.length > 0) {
          // Find the first enrolled course from the courses array
          const firstEnrolledCourse = courses.find(course => 
            enrolledCourses.includes(course.id || course._id)
          );
          if (firstEnrolledCourse) {
            console.log('🎯 Auto-selecting first enrolled course:', firstEnrolledCourse.title);
            selectCourse(firstEnrolledCourse);
          }
        }
      };

      // Small delay to ensure data is loaded
      const timeoutId = setTimeout(autoSelectCourse, 100);
      return () => clearTimeout(timeoutId);
    }, [selectedCourse, enrolledCourses, courses, userClearedSelection])
  );

  // Pull-to-refresh handler for the whole Learn page
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    fetchFeed();
    if (user?.id) {
      await fetchUserEnrollments(user.id);
      await fetchAllCourses();
      await fetchFeaturedCourse();
    }
    setRefreshing(false);
  }, [user?.id, fetchFeed, fetchUserEnrollments, fetchAllCourses, fetchFeaturedCourse]);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
      className="flex-1 bg-white"
    >
      {/* Show offline screen when no internet */}
      {!isOnline && <OfflineScreen />}
      
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing || is_loading}
            onRefresh={onRefresh}
          />
        }
      >
        {isLoading ? (
          <LearnPageSkeleton />
        ) : (
          <View className="px-6 pt-6 flex-1 bg-[#FAFAFA]">
            <Text className="text-2xl font-bold mb-6 text-gray-900">
              Lets
              <Text className="text-customBlue font-semibold"> Learn !</Text>
            </Text>

            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
              
            {/* Conditional rendering: Live Today first if there are classes, otherwise Subjects first */}
            {hasLiveClasses() ? (
              <>
                <LiveClasses onJoinPress={handleJoinPress} />
                <View className="mb-4">
                 
                  <MyCourses />
                </View>
              </>
            ) : (
              <>
                <View className="mb-4">
                 
                  <MyCourses />
                </View>
                <LiveClasses onJoinPress={handleJoinPress} />
              </>
            )}
            
            <View className="flex-row justify-between items-center mt-6 mb-4">
              <Text className="text-[1.3rem] font-bold text-gray-900">Upcoming Classes</Text>
              <TouchableOpacity onPress={() => {}}>
                <Text className="text-base text-blue-500 font-medium">View More</Text>
              </TouchableOpacity>
            </View>
      
            <ActiveCourses searchQuery={searchQuery} />
                      <View className="flex-row justify-between items-center mt-4 mb-4">
              <Text className="text-xl font-bold text-gray-900">Model Questions</Text>
              <TouchableOpacity onPress={() => {}}>
                <Text className="text-base text-blue-500 font-medium">View More</Text>
              </TouchableOpacity>
            </View>

            <ModelQuestions searchQuery={searchQuery} />
          
          </View>
        )}
      </ScrollView>

      <PrimaryNav current="Learn" />

      {/* Live Class Join Bottom Sheet - Rendered outside ScrollView */}
      {selectedClass && (
        <LiveClassJoinBottomSheet
          isVisible={showJoinSheet}
          onClose={() => setShowJoinSheet(false)}
          classData={{
            id: selectedClass.id,
            title: selectedClass.title,
            teacher: selectedClass.teacher,
            subject: selectedClass.subject,
            participants: selectedClass.participants,
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}
