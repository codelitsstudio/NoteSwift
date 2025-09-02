import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ListRenderItem,
  ImageSourcePropType,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type Course = {
  id: string;
  title: string;
  provider: string;
  type: string;
  rating: string;
  image: ImageSourcePropType;
};

const freeCourses: Course[] = [
  {
    id: "1",
    title: "Introduction to Calculus",
    provider: "NoteSwift Network",
    type: "Guided Project",
    rating: "4.2 (109)",
    image: require("../../../assets/images/notes1.png"),
  },
  {
    id: "2",
    title: "Algorithms, Part I",
    provider: "Princeton University",
    type: "Course",
    rating: "4.9 (11K)",
    image: require("../../../assets/images/notes1.png"),
  },
  {
    id: "3",
    title: "Basic English, Part II",
    provider: "NoteSwift Network",
    type: "Guided Project",
    rating: "4.2 (33)",
    image: require("../../../assets/images/notes1.png"),
  },
  {
    id: "4",
    title: "Computer Science: Programming with a Purpose",
    provider: "Princeton University",
    type: "Course",
    rating: "4.7 (1K)",
    image: require("../../../assets/images/notes1.png"),
  },
];

export default function FreeCoursesSection() {
  const renderItem: ListRenderItem<Course> = ({ item }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center bg-white py-4 px-3 mb-3 rounded-2xl border border-gray-100"
      onPress={() => console.log(`Pressed ${item.title}`)}
    >
      {/* Left side text */}
      <View className="flex-1 pr-3">
        <Text className="text-base font-semibold text-gray-900 mb-1">
          {item.title}
        </Text>
        <Text className="text-sm text-gray-600">{item.provider}</Text>
        <Text className="text-sm text-gray-500 mb-1">{item.type}</Text>
        <View className="flex-row items-center">
          <MaterialIcons name="star" size={16} color="#007AFF" />
          <Text className="ml-1 text-sm text-gray-700">{item.rating}</Text>
        </View>
      </View>

      {/* Right side image */}
      <Image
        source={item.image}
        className="w-24 h-24 rounded-lg"
        resizeMode="contain"
      />
    </TouchableOpacity>
  );

  return (
    <View className="mb-2">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4 px-1">
        <Text className="text-2xl font-bold text-gray-900">
         Get Started with The Free{'\n'}Courses
        </Text>
        <TouchableOpacity>
          <Text className="text-sm text-blue-500 font-medium">See All</Text>
        </TouchableOpacity>
      </View>

      {/* Course List */}
      <FlatList
        data={freeCourses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </View>
  );
}
