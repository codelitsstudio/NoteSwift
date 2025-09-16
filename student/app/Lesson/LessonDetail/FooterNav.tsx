// components/LessonDetail/FooterNav.tsx
import React from "react";
import { View, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface Props {
  onPrevious?: () => void;
  onSave?: () => void;
  onNext?: () => void;
}

const FooterNav: React.FC<Props> = ({ onPrevious, onSave, onNext }) => {
  const insets = useSafeAreaInsets();

  const handlePress = (key: "Previous" | "Save" | "Next") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (key === "Previous" && onPrevious) onPrevious();
    if (key === "Save" && onSave) onSave();
    if (key === "Next" && onNext) onNext();
  };

  return (
    <View className="absolute left-0 right-0 bottom-0">
      <View className="bg-gray-50 border-t border-gray-100 px-5 py-3">
        <View className="flex-row justify-between items-center">
          {/* Previous */}
          <Pressable
            onPress={() => handlePress("Previous")}
            className="flex-row items-center justify-center py-2 px-3 bg-gray-100 rounded-md min-w-[80px] gap-1"
          >
            <MaterialIcons name="arrow-back-ios" size={16} color="#3B82F6" />
            <Text className="text-sm font-medium text-gray-700">Previous</Text>
          </Pressable>

          {/* Save button */}
          <Pressable
            onPress={() => handlePress("Save")}
            className="flex-row items-center justify-center py-2 px-3 bg-gray-100 rounded-md min-w-[80px] gap-1"
          >
            <MaterialIcons name="save" size={16} color="#666" />
            <Text className="text-sm font-medium text-gray-700">Save</Text>
          </Pressable>

          {/* Next */}
          <Pressable
            onPress={() => handlePress("Next")}
            className="flex-row items-center justify-center py-2 px-3 bg-gray-100 rounded-md min-w-[80px] gap-1"
          >
            <Text className="text-sm font-medium text-gray-700">Notes</Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color="#3B82F6" />
          </Pressable>
        </View>
      </View>

      {/* Spacer for home bar */}
      <View style={{ height: insets.bottom }} className="bg-gray-50" />
    </View>
  );
};

export default FooterNav;