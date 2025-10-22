// components/ChapterDetail/TagPill.tsx
import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type TagType = "like" | "ask" | "download" | "comment" | "attachments";

type TagPillProps = {
  label: string;
  type: TagType;
  active?: boolean;
  onPress?: () => void;
  disabled?: boolean;
};

const iconFor = (type: TagType) => {
  switch (type) {
    case "like":
      return "thumb-up-off-alt";
    case "ask":
      return "question-answer";
    case "download":
      return "download";
    case "comment":
      return "comment";
    case "attachments":
      return "attach-file";
    default:
      return "label";
  }
};

const getActiveBgColor = (type: TagType, active: boolean) => {
  if (type === "like" && active) return "bg-blue-500";
  if (type === "attachments" && active) return "bg-black";
  return "bg-gray-200";
};

const TagPill: React.FC<TagPillProps> = ({ label, type, active = false, onPress, disabled }) => {
  const iconName = type === "like" && active ? "thumb-up" : iconFor(type);
  
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.8}
      disabled={disabled}
      className={`flex-row items-center px-3 py-2 rounded-full mr-3 ${
        getActiveBgColor(type, active)
      } ${disabled ? "opacity-50" : ""}`}
    >
      <MaterialIcons 
        name={iconName as any} 
        size={14} 
        color={active && (type === "like" || type === "attachments") ? "#fff" : "#374151"} 
      />
      <Text
        className={`ml-1 text-sm font-medium ${
          active && (type === "like" || type === "attachments") ? "text-white" : "text-gray-900"
        }`}
        style={disabled ? { color: '#a1a1aa' } : undefined}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default TagPill;
