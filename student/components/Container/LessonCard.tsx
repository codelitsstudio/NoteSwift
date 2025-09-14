import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface LessonCardProps {
  title: string;
  subtitle?: string;
  tags?: { type: "live" | "video" | "notes"; label: string }[];
  onPress?: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ title, subtitle, tags = [], onPress }) => {
  // If you want to highlight the first card, pass a prop like isFirst or index from the parent.
  // For now, check if title matches the first lesson's title ("Foundations of Effective Studying")
  const isFirst = title.trim().toLowerCase().startsWith("foundations of effective");
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mx-4 my-2 p-4 bg-white border rounded-xl flex-row items-center ${isFirst ? "border-blue-500" : "border-gray-200"}`}
      activeOpacity={0.85}
    >
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 mb-1">{title}</Text>
        {subtitle && (
          <Text className="text-xs text-gray-500 mb-1">{subtitle}</Text>
        )}
        <View className="flex-row flex-wrap">
          {tags.map((tag, index) => {
            const isVideo = tag.type === "video";
            return (
              <View
                key={index}
                className={`flex-row items-center mr-2 mb-1 mt-4 px-2 py-1 bg-gray-50 border rounded-full border-gray-200`}
              >
                <Icon
                  name={
                    tag.type === "live"
                      ? "videocam"
                      : tag.type === "video"
                      ? "play-circle-filled"
                      : "menu-book"
                  }
                  size={13}
                  color={
                    tag.type === "live"
                      ? "#16a34a"
                      : tag.type === "video" || tag.type === "notes"
                      ? "#2563eb"
                      : "#6b7280"
                  }
                />
                <Text
                  className={`ml-1 text-xs font-medium ${
                    tag.type === "live"
                      ? "text-green-700"
                      : "text-gray-700"
                  }`}
                >
                  {tag.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      <Icon name="chevron-right" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );
};

export default LessonCard;
