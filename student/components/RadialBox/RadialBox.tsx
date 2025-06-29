import React from "react";
import { View, Text, Pressable } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";

interface SubjectProgressCardProps {

    subject: string;
  year: number | string;

  completion: number;

  onPress?: () => void;
}


export default function SubjectProgressCard({
  subject,
  year,
  completion,
  onPress,
}: SubjectProgressCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-2xl bg-white p-6 mb-6 shadow-md"
    >
      {/* Left — title / subtitle */}
      <View className="flex-shrink">
        <Text className="text-2xl font-extrabold text-gray-900">
          {subject}
          <Text className="text-customBlue"> - {year}</Text>
        </Text>
        <Text className="mt-1 text-xl font-semibold text-gray-800">
          Completed Till now
        </Text>
      </View>

      {/* Right — circular progress */}
    <CircularProgress
  value={completion}
  maxValue={100}
  radius={52}
  activeStrokeWidth={10}
  inActiveStrokeWidth={8}
  progressValueColor="#3592F2"
  activeStrokeColor="#3592F2"
  inActiveStrokeColor="#e5e7eb"
  inActiveStrokeOpacity={1}
  valueSuffix="%"
/>

    </Pressable>
  );
}
