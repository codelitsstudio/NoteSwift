import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Course {
  id?: string;
  _id?: string;
  name: string;
  grade?: string;
  subject?: string;
  testsCount?: number;
  completedTests?: number;
  thumbnail?: any;
  title?: string;
  description?: string;
}

interface CourseCardProps {
  course: Course;
  onPress: () => void;
}

export default function CourseCard({ course, onPress }: CourseCardProps) {
  const progressPercentage = (course.testsCount || 0) > 0 
    ? Math.round(((course.completedTests || 0) / (course.testsCount || 0)) * 100) 
    : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100"
    >
      {/* Header with Icon */}
      <View className="h-28 bg-customBlue/10 flex items-center justify-center">
        <MaterialIcons name="school" size={48} color="#3B82F6" />
      </View>

      {/* Content */}
      <View className="p-3">
        {/* Title */}
        <Text className="text-sm font-bold text-gray-900 mb-1" numberOfLines={2}>
          {course.name || course.title}
        </Text>

        {/* Grade & Subject */}
        <Text className="text-xs text-gray-500 mb-2">
          {course.grade || 'Grade 12'} • {course.subject || 'Multiple Subjects'}
        </Text>

        {/* Tests Info */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm text-gray-600">
            {course.testsCount || 0} Tests
          </Text>
          <Text className="text-sm font-medium text-customBlue">
            {course.completedTests || 0} Done
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
