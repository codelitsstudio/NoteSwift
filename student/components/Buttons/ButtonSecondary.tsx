import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface ButtonSecondaryProps {
  title: string;
  onPress: () => void;
}

export default function ButtonSecondary({ title, onPress }: ButtonSecondaryProps) {
  return (
    <TouchableOpacity
      className="self-center w-3/4 border border-customBlue py-4 rounded-full items-center mb-[50px] mt-2"
      onPress={onPress}
    >
      <Text className="text-customBlue text-xl font-semibold">{title}</Text>
    </TouchableOpacity>
  );
}
