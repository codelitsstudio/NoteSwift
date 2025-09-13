import React from "react";
import { View, Text, ScrollView } from "react-native";
import CourseMiniCard from "../../../components/Container/CourseMiniCard";
import { useRouter } from "expo-router";

export default function FeaturedClasses() {
  const router = useRouter();

  const featured = [
    {
      id: 1,
      title: "Learn How To Actually Study Before It's Too Late",
      teacher: "ThatGuy (US), NoteSwift Research Team",
      time: "Anytime",
      image: require("../../../assets/images/course-1-thumbnail.jpg"),
      push: "/Home/Components/FirstCourseDescription", // route to navigate
    },
    {
      id: 2,
      title: "Ultimate Study Guide for Students",
      teacher: "NoteSwift Research Team",
      time: "Coming Soon",
      image: require("../../../assets/images/studyguide.jpg"),
      push: "/", // route for this course
    },
  ];

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mt-4 mb-4">
        <Text className="text-2xl font-bold text-gray-900">Featured Courses</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {featured.map((course) => (
          <CourseMiniCard
            key={course.id}
            title={course.title}
            teacher={course.teacher}
            time={course.time}
            image={course.image}
            onPress={() => router.push(course.push as any)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
