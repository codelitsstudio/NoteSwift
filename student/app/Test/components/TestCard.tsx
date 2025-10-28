import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Test {
  id: string;
  title: string;
  description?: string;
  type: 'mcq' | 'pdf' | 'mixed';
  courseId: string;
  courseName: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: 'not-started' | 'in-progress' | 'completed';
  score?: number;
  thumbnail?: any;
  duration?: number;
  totalQuestions?: number;
  totalMarks?: number;
}

interface TestCardProps {
  test: Test;
  onPress: () => void;
}

export default function TestCard({ test, onPress }: TestCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'hard':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50';
      case 'not-started':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mcq':
        return 'quiz';
      case 'pdf':
        return 'picture-as-pdf';
      case 'mixed':
        return 'assignment';
      default:
        return 'quiz';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
    >
      <View className="flex-row items-start">
        {/* Type Icon */}
        <View className="w-12 h-12 rounded-xl bg-customBlue/10 items-center justify-center mr-3 mt-1">
          <MaterialIcons 
            name={getTypeIcon(test.type)} 
            size={24} 
            color="#3B82F6" 
          />
        </View>

        {/* Content */}
        <View className="flex-1">
          {/* Title */}
          <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>
            {test.title}
          </Text>

          {/* Course Name */}
          <Text className="text-sm text-gray-500 mb-2">
            {test.courseName}
          </Text>

          {/* Meta Info */}
          <View className="flex-row items-center flex-wrap gap-2 mb-2">
            {/* Type Badge */}
            <View className="flex-row items-center bg-customBlue/10 px-2 py-1 rounded-md">
              <Text className="text-sm text-customBlue font-medium">
                {test.type.toUpperCase()}
              </Text>
            </View>

            {/* Duration */}
            <Text className="text-sm text-gray-500">
              {test.duration} min • {test.totalQuestions} Qs
            </Text>
          </View>

          {/* Status or Score */}
          {test.status === 'completed' && test.score !== undefined ? (
            <View className="flex-row items-center">
              <Text className="text-sm font-semibold text-customBlue">
                Score: {test.score}/{test.totalMarks}
              </Text>
            </View>
          ) : test.status === 'in-progress' ? (
            <View className="flex-row items-center">
              <Text className="text-sm font-medium text-customBlue">
                Continue
              </Text>
              <MaterialIcons name="chevron-right" size={18} color="#3B82F6" />
            </View>
          ) : (
            <View className="flex-row items-center">
              <Text className="text-sm font-medium text-gray-500">
                Start Test
              </Text>
              <MaterialIcons name="chevron-right" size={18} color="#6B7280" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
