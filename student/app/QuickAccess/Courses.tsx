// app/QuickAccess/Courses.tsx
import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Courses: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg font-bold">Courses</Text>
        <Text className="text-gray-500 mt-2">This feature is coming soon!</Text>
      </View>
    </SafeAreaView>
  );
};

export default Courses;