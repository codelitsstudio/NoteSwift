import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Course } from '../testData';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
}

export default function CourseCard({ course, onPress }: CourseCardProps) {
  const progressPercentage = course.testsCount > 0 
    ? Math.round((course.completedTests / course.testsCount) * 100) 
    : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100"
    >
      {/* Thumbnail */}
      <View className="h-28 bg-gray-100">
        <Image
          source={course.thumbnail}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={300}
        />
      </View>

      {/* Content */}
      <View className="p-3">
        {/* Title */}
        <Text className="text-sm font-bold text-gray-900 mb-1" numberOfLines={2}>
          {course.name}
        </Text>

        {/* Grade & Subject */}
        <Text className="text-xs text-gray-500 mb-2">
          {course.grade} • {course.subject}
        </Text>

        {/* Tests Info */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm text-gray-600">
            {course.testsCount} Tests
          </Text>
          <Text className="text-sm font-medium text-customBlue">
            {course.completedTests} Done
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <View
            className="h-full bg-customBlue rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
