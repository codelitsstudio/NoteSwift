// components/LessonDetail/TranscriptItem.tsx
import React from "react";
import { View, Text } from "react-native";

type Props = {
  time: string; // e.g. "0:00 – 2:00"
  text: string;
};

const TranscriptItem: React.FC<Props> = ({ time, text }) => {
  return (
    <View className="flex-row px-4 py-4 items-start border-b border-gray-200">
      {/* time column */}
      <View className="w-24 pr-2">
        <Text className="text-xs text-gray-500">{time}</Text>
      </View>
      {/* plain text, NO BOX */}
      <View className="flex-1 pr-2">
        <Text className="text-sm text-gray-800 leading-6">{text}</Text>
      </View>
    </View>
  );
};

export default TranscriptItem;
