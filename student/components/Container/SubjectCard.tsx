import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface SubjectCardProps {
  /** Subject title, e.g., "Science" */
  subject: string;
  /** Sub‑label beneath the title, e.g., "Syllabus‑2082" */
  syllabus: string;
  /** Optional handler fired when the card is pressed */
  onPress?: () => void;
}

/**
 * A compact, tappable card that mirrors the design shown in your screenshot.
 * Uses Tailwind utility classes via NativeWind.
 */
export default function SubjectCard({ subject, syllabus, onPress }: SubjectCardProps) {
  return (
    <Pressable
      onPress={onPress}
className="flex-row items-center justify-between rounded-3xl bg-white p-5 shadow mt-3 shadow-gray-200"
    >
      <View>
        <Text className="text-lg font-semibold text-gray-900">{subject}</Text>
        <Text className="text-xs text-gray-500">{syllabus}</Text>
      </View>

      {/* Material Icons arrow */}
      <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
    </Pressable>
  );
}