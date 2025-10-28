import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useGlobalSearchParams } from 'expo-router';
import axios from '../../../api/axios';

export default function ModuleTestListHeader() {
  const router = useRouter();
  const localParams = useLocalSearchParams();
  const globalParams = useGlobalSearchParams();
  
  // Try both local and global params
  const courseName = (localParams.courseName || globalParams.courseName) as string;
  const subjectName = (localParams.subject || globalParams.subject) as string;

  const fetchCourseDetails = useCallback(async () => {
    if (!courseName) return;
    
    try {
      // Search for course by title since we have courseName
      const response = await axios.get('/courses', {
        params: { search: courseName, limit: 1 }
      });
      
      if (response.data.success && response.data.data.courses.length > 0) {
        // Course data fetched but not used in UI
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  }, [courseName]);

  useEffect(() => {
    if (courseName) {
      fetchCourseDetails();
    }
  }, [courseName, fetchCourseDetails]);

  return (
    <SafeAreaView className="bg-white" edges={['top']}>
      <View className="px-6 pt-4 pb-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <MaterialIcons name="chevron-left" size={28} color="#111827" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
              {subjectName || 'Subject Tests'}
            </Text>
            <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
              {courseName || 'Available Tests'}
            </Text>
          </View>
          <View className="w-7" />
        </View>
      </View>
    </SafeAreaView>
  );
}
