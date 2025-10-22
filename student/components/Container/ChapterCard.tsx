import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface ChapterCardProps {
  title: string;
  subtitle?: string;
  tags?: { type: "live" | "video" | "notes"; label: string; count?: number }[];
  onPress?: () => void;
  isActive?: boolean;
}

const ChapterCard: React.FC<ChapterCardProps> = ({ title, subtitle, tags = [], onPress, isActive }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mx-6 my-2 p-4 bg-white border rounded-3xl flex-row items-center border-gray-200`}
      activeOpacity={0.85}
    >
      <View className="flex-1 mx-1">
        <Text className="text-base font-semibold text-gray-900 mb-1">{title}</Text>
        {subtitle && (
          <Text className="text-xs text-gray-500 mb-1">{subtitle}</Text>
        )}
        <View className="flex-row flex-wrap">
          {tags.map((tag, index) => {
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
                  {tag.count ? `${tag.count} ${tag.label}` : tag.label}
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

export default ChapterCard;
