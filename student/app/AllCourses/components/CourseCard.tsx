import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

interface Course {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  type: 'free' | 'pro';
  grade?: string;
  subject?: string;
  duration?: string;
  rating?: number;
  enrolledCount?: number;
  skills?: string[];
  features?: string[];
  isFeatured?: boolean;
}

interface CourseCardProps {
  course: Course;
  onPress: () => void;
}

export default function CourseCard({ course, onPress }: CourseCardProps) {
  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `Rs. ${price}`;
  };

  const formatEnrolledCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const iconClass = `w-12 h-12 rounded-lg items-center justify-center mr-4 ${
    course.type === 'pro' ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-green-100'
  }`;
  const typeBadgeClass = `px-2 py-1 rounded-full ${
    course.type === 'pro' ? 'bg-purple-100' : 'bg-green-100'
  }`;
  const typeTextClass = `text-xs font-medium ${
    course.type === 'pro' ? 'text-purple-700' : 'text-green-700'
  }`;
  const priceTextClass = `font-bold text-lg ${
    course.type === 'pro' ? 'text-purple-600' : 'text-green-600'
  }`;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        {/* Icon */}
        <View className={iconClass}>
          <MaterialIcons 
            name={course.icon as any} 
            size={24} 
            color={course.type === 'pro' ? 'white' : '#16A34A'} 
          />
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>
              {course.name}
            </Text>
            <View className={typeBadgeClass}>
              <Text className={typeTextClass}>
                {course.type.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
            {course.description}
          </Text>

          {/* Price and Rating */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className={priceTextClass}>
              {formatPrice(course.price)}
            </Text>
            {course.rating && (
              <View className="flex-row items-center">
                <MaterialIcons name="star" size={16} color="#F59E0B" />
                <Text className="text-gray-700 text-sm ml-1">{course.rating}</Text>
              </View>
            )}
          </View>

          {/* Duration and Enrolled */}
          <View className="flex-row items-center justify-between">
            {course.duration && (
              <View className="flex-row items-center">
                <MaterialIcons name="schedule" size={14} color="#6B7280" />
                <Text className="text-gray-500 text-xs ml-1">{course.duration}</Text>
              </View>
            )}
            {course.enrolledCount && (
              <View className="flex-row items-center">
                <MaterialIcons name="people" size={14} color="#6B7280" />
                <Text className="text-gray-500 text-xs ml-1">
                  {formatEnrolledCount(course.enrolledCount)} enrolled
                </Text>
              </View>
            )}
          </View>

          {/* Skills Tags */}
          {course.skills && course.skills.length > 0 && (
            <View className="flex-row flex-wrap mt-2">
              {course.skills.slice(0, 3).map((skill, index) => (
                <View key={index} className="bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1">
                  <Text className="text-xs text-gray-600">{skill}</Text>
                </View>
              ))}
              {course.skills.length > 3 && (
                <View className="bg-gray-100 rounded-full px-2 py-1">
                  <Text className="text-xs text-gray-600">+{course.skills.length - 3}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}