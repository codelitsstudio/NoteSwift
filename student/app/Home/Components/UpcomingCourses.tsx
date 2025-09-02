import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import CourseMiniCard from "../../../components/Container/CourseMiniCard";

const courses = [
  {
    id: 1,
    title: "Science Class",
    teacher: "Niru Nirmala",
    time: "9:00pm - 10:00pm",
    image: require("../../../assets/images/science.png"),
  },
  {
    id: 2,
    title: "Maths Class",
    teacher: "Raju Shrestha",
    time: "8:00pm - 9:00pm",
    image: require("../../../assets/images/maths.avif"),
  },
  {
    id: 3,
    title: "English Class",
    teacher: "Anita Joshi",
    time: "7:00pm - 8:00pm",
    image: require("../../../assets/images/science.png"),
  },
];

export default function UpcomingCourses() {
  return (
    <View className="mb-6">
       {/* Upcoming */}
                <View className="flex-row justify-between items-center mt-4 mb-4">
                  <Text className="text-2xl font-bold text-gray-900">Upcoming Classes</Text>
                  <TouchableOpacity onPress={() => {}}>
                    <Text className="text-base text-blue-500 font-medium">View More</Text>
                  </TouchableOpacity>
                </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {courses.map((course) => (
          <CourseMiniCard
            key={course.id}
            title={course.title}
            teacher={course.teacher}
            time={course.time}
            image={course.image}
            onPress={() => console.log(`Pressed ${course.title}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
