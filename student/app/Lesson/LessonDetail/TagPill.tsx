// components/LessonDetail/TagPill.tsx
import React from "react";
import { TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Tag = {
  label: string;
  type?: "live" | "video" | "notes" | "attachments";
  active?: boolean;
  onPress?: () => void;
};

const iconFor = (type?: Tag["type"]) => {
  if (type === "live") return "live-tv";
  if (type === "video") return "play-circle-filled";
  if (type === "notes") return "menu-book";
  if (type === "attachments") return "attach-file";
  return "label";
};

const TagPill: React.FC<Tag> = ({ label, type, active = false, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`flex-row items-center px-3 py-1.5 rounded-full mr-2 ${
        active ? "bg-black" : "bg-gray-200"
      }`}
    >
      <Icon name={iconFor(type)} size={14} color={active ? "#fff" : "#374151"} />
      <Text
        className={`ml-1 text-sm font-medium ${
          active ? "text-white" : "text-gray-900"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default TagPill;
