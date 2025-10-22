import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, ActivityIndicator } from "react-native";
import CourseMiniCard from "../../../components/Container/CourseMiniCard";
import { useRouter } from "expo-router";
import { useCourseStore } from "../../../stores/courseStore";
import axios from "@/api/axios";

interface Course {
  _id: string;
  title: string;
  description: string;
  price?: number;
  type: string;
  status: string;
  icon?: string;
  skills?: string[];
  features?: string[];
  offeredBy?: string;
  thumbnail?: string;
}

export default function FeaturedClasses() {
  const router = useRouter();
  const [homepageFeaturedCourses, setHomepageFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { courses } = useCourseStore();

  // Fetch homepage featured courses
  const fetchHomepageFeaturedCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/courses/homepage/featured');
      if (response.data.success) {
        setHomepageFeaturedCourses(response.data.data.courses);
      }
    } catch (error) {
      console.error('Error fetching homepage featured courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepageFeaturedCourses();
  }, []);

  if (loading) {
    return (
      <View className="mb-6">
        <View className="flex-row justify-between items-center mt-4 mb-4">
          <Text className="text-2xl font-bold text-gray-900">Featured Courses</Text>
        </View>
        <View className="rounded-lg p-6 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-sm text-gray-500 mt-4">Loading featured courses...</Text>
        </View>
      </View>
    );
  }

  if (homepageFeaturedCourses.length === 0) {
    return (
      <View className="mb-6">
        <View className="flex-row justify-between items-center mt-4 mb-4">
          <Text className="text-2xl font-bold text-gray-900">Featured Courses</Text>
        </View>
        <View className="rounded-lg p-6 items-center justify-center">
          <Image
            source={require('../../../assets/images/Circles.gif')}
            style={{ width: 180, height: 180, marginBottom: 16 }}
          />
          <Text className="text-lg font-semibold text-gray-800">
            No featured courses available
          </Text>
          <Text className="text-sm text-gray-500 mt-1 text-center px-4">
            Featured courses will appear here soon!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mt-4 mb-4">
        <Text className="text-2xl font-bold text-gray-900">Featured Courses</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {homepageFeaturedCourses.map((course) => (
          <CourseMiniCard
            key={course._id}
            title={course.title}
            teacher={course.offeredBy || "NoteSwift"}
            time="Anytime"
            image={course.thumbnail ? { uri: course.thumbnail } : require("../../../assets/images/onb-5.png")}
            onPress={() => router.push(`/Home/Components/PackageDetails?packageData=${encodeURIComponent(JSON.stringify({ ...course, type: course.type }))}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
