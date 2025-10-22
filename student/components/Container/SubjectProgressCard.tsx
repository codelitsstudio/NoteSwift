import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface SubjectProgressCardProps {
  /** Subject title, e.g., "Science" */
  subject: string;
  /** Academic year, e.g., 2082 */
  year: number;
  /** Completion percentage (0-100) */
  completion: number;
  /** Optional handler fired when the card is pressed */
  onPress?: () => void;
}

/**
 * A progress card that shows subject information with completion percentage.
 * Uses Tailwind utility classes via NativeWind.
 */
export default function SubjectProgressCard({ 
  subject, 
  year, 
  completion, 
  onPress 
}: SubjectProgressCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-3xl bg-white p-5 shadow-lg shadow-gray-200 mb-4"
    >
      <View className="flex-1">
        <Text className="text-xl font-bold text-gray-900">{subject}</Text>
        <Text className="text-sm text-gray-500 mb-2">Syllabus-{year}</Text>
        
        {/* Progress Bar */}
        <View className="flex-row items-center">
          <View className="flex-1 h-2 bg-gray-200 rounded-full mr-3">
            <View 
              className="h-2 bg-blue-500 rounded-full" 
              style={{ width: `${completion}%` }}
            />
          </View>
          <Text className="text-sm font-medium text-gray-700">{completion}%</Text>
        </View>
      </View>

      {/* Material Icons arrow */}
      <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
    </Pressable>
  );
}
