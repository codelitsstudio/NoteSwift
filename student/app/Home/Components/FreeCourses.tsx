import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCourseStore } from "../../../stores/courseStore";

interface Package {
  id: string;
  title: string;
  description: string;
  type: 'free' | 'pro';
  isFeatured: boolean;
  price?: number;
  skills: string[];
  learningPoints: string[];
  features: string[];
}

type Course = {
  id: string;
  title: string;
  provider: string;
  type: string;
  rating: string;
  image: ImageSourcePropType;
  package: Package;
};

export default function FreeCourses() {
  const { courses, is_loading } = useCourseStore();

  if (is_loading) {
    return (
      <View className="mb-6">
        <View className="flex-row justify-between items-center mt-4 mb-4">
          <Text className="text-2xl font-bold text-gray-900">Free Courses</Text>
        </View>
        <View className="rounded-lg p-6 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-sm text-gray-500 mt-4">Loading free courses...</Text>
        </View>
      </View>
    );
  }

  // Filter courses that are free and published
  const freeCourses: Course[] = courses
    .filter(course => course.type === 'free' && course.status === 'Published')
    .map(course => ({
      id: course.id || course._id,
      title: course.title,
      provider: course.offeredBy || "NoteSwift Network",
      type: "Free Course",
      rating: course.rating ? `${course.rating} (${course.enrolledCount || 0})` : "4.9 (0)",
      image: course.thumbnail ? {uri: course.thumbnail} : require("../../../assets/images/notes1.png"),
      package: {
        id: course.id || course._id,
        title: course.title,
        description: course.description,
        type: 'free',
        isFeatured: course.isFeatured || false,
        skills: course.skills || [],
        learningPoints: course.learningPoints || [],
        features: course.features || []
      }
    }));

  if (freeCourses.length === 0) {
    return (
      <View className="mb-6">
        <View className="flex-row justify-between items-center mt-4 mb-4">
          <Text className="text-2xl font-bold text-gray-900">Free Courses</Text>
        </View>
        <View className="rounded-lg p-6 items-center justify-center">
          <Image
            source={require('../../../assets/images/Freelancer.gif')}
            style={{ width: 220, height: 220, marginBottom: 4 }}
          />
          <Text className="text-lg font-semibold text-gray-800">
            No free courses available
          </Text>
          <Text className="text-sm text-gray-500 mt-1 text-center px-4">
            Check back later for new free courses!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mt-4 mb-4">
        <Text className="text-2xl font-bold text-gray-900">Free Courses</Text>
        <TouchableOpacity>
          <Text className="text-base text-blue-500 font-medium">View All</Text>
        </TouchableOpacity>
      </View>
      <View className="px-1">
        {freeCourses.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 p-4 mb-4"
            onPress={() => {
              router.push({
                pathname: '/Home/Components/PackageDetails',
                params: { packageData: JSON.stringify(item.package) }
              });
            }}
          >
            <View className="flex-row">
              <Image
                source={item.image}
                className="w-20 h-20 rounded-lg mr-4"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  {item.title}
                </Text>
                <Text className="text-sm text-gray-600 mb-2">
                  {item.provider}
                </Text>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <MaterialIcons name="star" size={16} color="#fbbf24" />
                    <Text className="text-sm text-gray-600 ml-1">
                      {item.rating}
                    </Text>
                  </View>
                  <View className="bg-green-100 px-2 py-1 rounded-full">
                    <Text className="text-xs font-medium text-green-800">
                      {item.type}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
