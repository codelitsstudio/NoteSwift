// components/Container/CoursesCard.tsx
import React from "react";
import { View, Text, Image } from "react-native";
import ButtonThird from "../Buttons/ButtonThird";

type Props = {
  title: string;
  grade: string;
  batch: string;
  image: any;
  onPress: () => void;
  buttonLabel?: string; // Optional: default to "Join Now"
};

export default function CourseCard({
  title,
  grade,
  batch,
  image,
  onPress,
  buttonLabel = "Join Now", // fallback label
}: Props) {
  return (
    <View className="bg-white rounded-3xl shadow-md w-[48%] p-4 items-start">
      <Image
        source={image}
        style={{ width: "100%", height: 120, borderRadius: 16 }}
        resizeMode="cover"
      />

      <Text className="text-base font-semibold text-gray-900 mt-3">
        {title}
      </Text>
      <Text className="text-sm text-gray-600 mt-1">{grade}</Text>
      <Text className="text-xs text-gray-400 mb-3">{batch}</Text>

      <ButtonThird label={buttonLabel} onPress={onPress} />
    </View>
  );
}
