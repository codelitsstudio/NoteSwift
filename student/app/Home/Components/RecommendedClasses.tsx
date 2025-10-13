import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { router } from "expo-router";
import CourseMiniCard from "../../../components/Container/CourseMiniCard";
import { useCourseStore } from "../../../stores/courseStore";
import { useAuthStore } from "../../../stores/authStore";
import axios from "../../../api/axios";

interface Recommendation {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  type: string;
  price?: number;
  recommendationData?: {
    targetGrades: string[];
    targetAudience: string;
    difficultyLevel: string;
    recommendedFor: string[];
    confidence: number;
  };
}

export default function RecommendationClasses() {
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchRecommendations();
    }
  }, [user?.id]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/courses/recommendations');
      if (response.data.success) {
        setRecommendations(response.data.data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="mb-6">
        <View className="flex-row justify-between items-center mt-4 mb-4">
          <Text className="text-2xl font-bold text-gray-900">Recommended For You</Text>
        </View>
        <View className="rounded-lg p-6 items-center justify-center">
          <Image
            source={require('../../../assets/images/Loading.gif')}
            style={{ width: 160, height: 160, marginBottom: 16 }}
          />
          <Text className="text-sm font-semibold text-gray-800">
            Finding perfect courses for you...
          </Text>
        </View>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return (
      <View className="mb-6">
        <View className="flex-row justify-between items-center mt-4 mb-4">
          <Text className="text-2xl font-bold text-gray-900">Recommended For You</Text>
        </View>
        <View className="rounded-lg p-6 items-center justify-center">
          <Image
            source={require('../../../assets/images/Processing.gif')}
            style={{ width: 180, height: 180, marginBottom: 16 }}
          />
          <Text className="text-lg font-semibold text-gray-800">
            Recommendations coming soon!
          </Text>
          <Text className="text-sm text-gray-500 mt-1 text-center px-4">
            We're analyzing courses to find the perfect matches for your grade.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mt-4 mb-4">
        <Text className="text-2xl font-bold text-gray-900">Recommended For You</Text>
        <Text className="text-sm text-gray-500">AI-powered • Grade {user?.grade || '10'}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {recommendations.map((course) => (
          <CourseMiniCard
            key={course._id}
            title={course.title}
            teacher={course.recommendationData?.targetAudience || "AI Recommended"}
            time={course.recommendationData?.difficultyLevel || "Adaptive"}
            image={course.thumbnail ? { uri: course.thumbnail } : require("../../../assets/images/course-1-thumbnail.jpg")}
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
