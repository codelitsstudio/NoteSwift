import React, { useEffect, useState, useCallback } from 'react';
import { RefreshControl } from 'react-native';
import {
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
import MyCourses from './Components/MyCourses';
import { useAuthStore } from '../../stores/authStore';
import { useCourseStore } from '../../stores/courseStore';
import LiveClasses from './Components/LiveClasses';

export default function HomePage() {
  // Network status monitoring
  const isOnline = useNetworkStatus();
  
  const [searchQuery, setSearchQuery] = useState('');
  const fetchFeed = useLearnStore(state=>state.fetchFeed);
  const { user } = useAuthStore();
  const { fetchUserEnrollments, fetchAllCourses, fetchFeaturedCourse, is_loading } = useCourseStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(()=>{
    fetchFeed();
  }, []);

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
        <View className="px-6 pt-6 flex-1 bg-[#FAFAFA]">
          <Text className="text-2xl font-bold mb-6 text-gray-900">
            Lets
            <Text className="text-customBlue font-semibold"> Learn !</Text>
          </Text>

          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
            
      
      <MyCourses />
          <LiveClasses />
          <View className="flex-row justify-between items-center mt-6 mb-4">
            <Text className="text-[1.3rem] font-bold text-gray-900">Upcoming Classes</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text className="text-base text-blue-500 font-medium">View More</Text>
            </TouchableOpacity>
          </View>
    
          <ActiveCourses searchQuery={searchQuery} />
                    <View className="flex-row justify-between items-center mt-4 mb-4">
            <Text className="text-2xl font-bold text-gray-900">Model Questions</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text className="text-base text-blue-500 font-medium">View More</Text>
            </TouchableOpacity>
          </View>

          <ModelQuestions searchQuery={searchQuery} />
        
        </View>
      </ScrollView>

      <PrimaryNav current="Learn" />
    </KeyboardAvoidingView>
  );
}
