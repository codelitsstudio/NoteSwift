import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface ButtonPrimaryProps {
  title: string;
  onPress: () => void;
}

export default function ButtonPrimary({ title, onPress }: ButtonPrimaryProps) {
  return (
    <TouchableOpacity
      className="w-full bg-customBlue py-4 rounded-full items-center mb-4 mt-2"
      onPress={onPress}
    >
      <Text className="text-white text-xl font-semibold">{title}</Text>
    </TouchableOpacity>
  );
}
