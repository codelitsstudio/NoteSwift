import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import axios from "@/api/axios";
import CourseMiniCard from "../../../components/Container/CourseMiniCard";
import { useCourseStore } from "../../../stores/courseStore";

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
  duration?: string;
}

export default function UpcomingCourses() {
  const [homepageUpcomingCourses, setHomepageUpcomingCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { courses } = useCourseStore();

  // Fetch homepage upcoming courses
  const fetchHomepageUpcomingCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/courses/homepage/upcoming');
      if (response.data.success) {
        setHomepageUpcomingCourses(response.data.data.courses);
      }
    } catch (error) {
      console.error('Error fetching homepage upcoming courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepageUpcomingCourses();
  }, []);

  if (loading) {
    return (
      <View className="mb-6">
        <View className="flex-row justify-between items-center mt-4 mb-4">
          <Text className="text-2xl font-bold text-gray-900">Upcoming Courses</Text>
        </View>
        <View className="rounded-lg p-6 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-sm text-gray-500 mt-4">Loading upcoming courses...</Text>
        </View>
      </View>
    );
  }

  if (homepageUpcomingCourses.length === 0) {
    return (
      <View className="mb-6">
        <View className="flex-row justify-between items-center mt-4 mb-4">
          <Text className="text-2xl font-bold text-gray-900">Upcoming Courses</Text>
        </View>
        <View className="rounded-lg p-6 items-center justify-center">
          <Image
            source={require('../../../assets/images/classes.gif')}
            style={{ width: 180, height: 180, marginBottom: 16 }}
          />
          <Text className="text-lg font-semibold text-gray-800">
            No upcoming courses available
          </Text>
          <Text className="text-sm text-gray-500 mt-1 text-center px-4">
            Stay tuned for exciting new courses!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mt-4 mb-4">
        <Text className="text-2xl font-bold text-gray-900">Upcoming Courses</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {homepageUpcomingCourses.map((course) => (
          <CourseMiniCard
            key={course._id}
            title={course.title}
            teacher={course.offeredBy || "NoteSwift"}
            time={course.duration || "Coming Soon"}
            image={course.thumbnail ? { uri: course.thumbnail } : require("../../../assets/images/Plus.png")}
            onPress={() => {
              router.push({
                pathname: '/Home/Components/PackageDetails',
                params: { packageData: JSON.stringify({ ...course, type: course.type || 'pro' }) }
              });
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}
