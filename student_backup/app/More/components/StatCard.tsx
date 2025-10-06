// more/components/StatCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const StatCard = () => {
  const totalCoursesAvailable = 4; // example value
  const router = useRouter();

  return (
    <View className="px-5 mt-6 mb-2">
      <View className="bg-white rounded-2xl border border-gray-200 p-5">
        {/* Top Section */}
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-gray-500 text-sm font-medium">Platform Stats</Text>
            <Text className="text-blue-600 text-lg font-bold mt-1">
              Total Courses Available
            </Text>
            <Text className="text-black text-2xl font-extrabold mt-1">
              {totalCoursesAvailable}
            </Text>
          </View>

          {/* Explore Button */}
          <TouchableOpacity
            className="bg-blue-100 rounded-full px-3 py-2 flex-row items-center"
            onPress={() => router.push('/AllCourses/AllCoursesPage')}
          >
            <MaterialIcons name="explore" size={20} color="#2563EB" />
            <Text className="text-blue-600 text-sm font-medium ml-1">Explore</Text>
          </TouchableOpacity>
        </View>

  {/* Bottom Stats Section */}
<View className="flex-row justify-between mx-2 mt-4">
  {/* Top Courses (start/left) */}
  <View className="items-start">
    <View className="flex-row items-center mb-1">
      <MaterialIcons name="whatshot" size={16} color="#2563EB" />
      <Text className="text-gray-500 text-xs font-medium ml-0">Top Courses</Text>
    </View>
    <Text className="text-gray-900 text-lg font-bold">3</Text>
  </View>

  {/* Categories (center) */}
  <View className="items-start">
    <View className="flex-row items-center mb-1">
      <MaterialIcons name="category" size={16} color="#2563EB" />
      <Text className="text-gray-500 text-xs font-medium ml-0">Categories</Text>
    </View>
    <Text className="text-gray-900 text-lg font-bold">3</Text>
  </View>

  {/* Avg Rating (end/right) */}
  <View className="items-start">
    <View className="flex-row items-center mb-1">
      <MaterialIcons name="star" size={16} color="#2563EB" />
      <Text className="text-gray-500 text-xs font-medium ml-0">Avg Rating</Text>
    </View>
    <Text className="text-gray-900 text-lg font-bold">4.5 ★</Text>
  </View>
</View>

      </View>
    </View>
  );
};

export default StatCard;
