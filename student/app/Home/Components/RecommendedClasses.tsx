import React from "react";
import { View, Text, ScrollView } from "react-native";
import CourseMiniCard from "../../../components/Container/CourseMiniCard";

const recommended = [
  {
    id: 1,
    title: "Advanced Algebra",
    teacher: "Prakash Thapa",
    time: "Anytime",
    image: require("../../../assets/images/maths.avif"),
  },
  {
    id: 2,
    title: "Creative Writing",
    teacher: "Anita Joshi",
    time: "Anytime",
    image: require("../../../assets/images/science.png"),
  },
];

export default function RecommendationClasses() {
  return (
    <View className="mb-6">
 <View className="flex-row justify-between items-center mt-4 mb-4">
                  <Text className="text-2xl font-bold text-gray-900">Recommended For You</Text>
             
                </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {recommended.map((course) => (
          <CourseMiniCard
            key={course.id}
            title={course.title}
            teacher={course.teacher}
            time={course.time}
            image={course.image}
            onPress={() => console.log(`Recommended ${course.title}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
