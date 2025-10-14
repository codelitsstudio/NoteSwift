import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useGlobalSearchParams } from 'expo-router';
import { demoCourses } from '@/app/Test/testData';

export default function CourseTestListHeader() {
  const router = useRouter();
  const localParams = useLocalSearchParams();
  const globalParams = useGlobalSearchParams();
  
  // Try both local and global params
  const courseId = (localParams.courseId || globalParams.courseId) as string;
  const course = demoCourses.find(c => c.id === courseId);

  // If course not found, show a simple back button header
  if (!course) {
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
            <View className="flex-1" />
            <View className="w-7" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text className="text-lg font-bold text-gray-900">
            {course.name}
          </Text>
          <Text className="text-sm text-gray-500 mt-0.5">
            {course.grade} • {course.subject}
          </Text>
        </View>
        <View className="w-7" />
      </View>

      {/* Stats */}
      <View className="bg-white rounded-xl p-3 border border-gray-100 mt-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm text-gray-500 mb-0.5">Total</Text>
            <Text className="text-lg font-bold text-gray-900">{course.testsCount}</Text>
          </View>
          <View className="w-px h-8 bg-gray-200" />
          <View className="flex-1 items-center">
            <Text className="text-sm text-gray-500 mb-0.5">Completed</Text>
            <Text className="text-lg font-bold text-customBlue">{course.completedTests}</Text>
          </View>
          <View className="w-px h-8 bg-gray-200" />
          <View className="flex-1 items-end">
            <Text className="text-sm text-gray-500 mb-0.5">Pending</Text>
            <Text className="text-lg font-bold text-gray-900">{course.testsCount - course.completedTests}</Text>
          </View>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
}
