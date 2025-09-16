// components/LessonDetail/TagPill.tsx
import React from "react";
import { TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Tag = {
  label: string;
  type?: "live" | "video" | "attachments";
  active?: boolean;
  onPress?: () => void;
  disabled?: boolean;
};

const iconFor = (type?: Tag["type"]) => {
  if (type === "live") return "live-tv";
  if (type === "video") return "play-circle-filled";
  if (type === "attachments") return "attach-file";
  return "label";
};

const TagPill: React.FC<Tag> = ({ label, type, active = false, onPress, disabled }) => {
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.8}
      disabled={disabled}
      className={`flex-row items-center px-3 py-1.5 rounded-full mr-2 ${
        active ? "bg-black" : "bg-gray-200"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <Icon name={iconFor(type)} size={14} color={active ? "#fff" : "#374151"} />
      <Text
        className={`ml-1 text-sm font-medium ${
          active ? "text-white" : "text-gray-900"
        }`}
        style={disabled ? { color: '#a1a1aa' } : undefined}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default TagPill;
