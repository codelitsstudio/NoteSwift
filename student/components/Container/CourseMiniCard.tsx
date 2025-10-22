import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

type Props = {
  title: string;
  teacher: string;
  time: string;
  image: any;
  onPress: () => void;
};

export default function CourseMiniCard({ title, teacher, time, image, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl mr-2 w-[163px] border border-gray-100"
    >
      <Image
        source={image}
        style={{ width: "100%", height: 100, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-xs text-gray-500" numberOfLines={1}>
          {teacher}
        </Text>
        <Text className="text-xs text-gray-400">{time}</Text>
      </View>
    </TouchableOpacity>
  );
}
