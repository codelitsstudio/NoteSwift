import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface LessonCardProps {
  title: string;
  tags?: { type: "live" | "video" | "notes"; label: string }[];
  onPress?: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ title, tags = [], onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mx-4 my-2 p-4 bg-white rounded-xl border border-gray-100"
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800 mb-2">{title}</Text>
          <View className="flex-row flex-wrap">
            {tags.map((tag, index) => (
              <View
                key={index}
                className="flex-row items-center mr-2 mb-2 px-2 py-1 bg-gray-100 rounded-full"
              >
                <Icon
                  name={
                    tag.type === "live"
                      ? "videocam"
                      : tag.type === "video"
                      ? "play-circle-filled"
                      : "menu-book"
                  }
                  size={14}
                  color={tag.type === "live" ? "#16a34a" : "#000"}
                />
                <Text
                  className={`ml-1 text-xs ${
                    tag.type === "live" ? "text-green-600" : "text-gray-700"
                  }`}
                >
                  {tag.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <Icon name="chevron-right" size={22} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );
};

export default LessonCard;
