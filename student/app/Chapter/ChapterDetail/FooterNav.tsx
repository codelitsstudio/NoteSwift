// components/ChapterDetail/FooterNav.tsx
import React from "react";
import { View, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

interface Props {
  onPrevious?: () => void;
  onSave?: () => void;
  onNext?: () => void;
  currentModule?: string;
  videoCompleted?: boolean;
}

const FooterNav: React.FC<Props> = ({ onPrevious, onSave, onNext, currentModule = '1', videoCompleted = false }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handlePress = (key: "Previous" | "Save" | "Notes") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (key === "Previous" && onPrevious) onPrevious();
    if (key === "Save" && onSave) onSave();
    if (key === "Notes") {
      if (onNext) onNext();
      router.push({
        pathname: "/Chapter/ChapterDetail/NotesAndReadable",
        params: { module: currentModule }
      });
    }
  };

  return (
    <View className="absolute left-0 right-0 bottom-0">
      <View className="bg-gray-50 border-t border-gray-100 px-5 py-3">
        <View className="flex-row justify-between items-center">
          {/* Previous */}
          <Pressable
            onPress={() => handlePress("Previous")}
            className="flex-row items-center justify-center py-2 px-3 bg-gray-100 rounded-3xl min-w-[80px] gap-1"
          >
            <Text className="text-sm font-medium text-gray-700">Previous</Text>
          </Pressable>

          <Pressable
            onPress={() => handlePress("Save")}
            className="flex-row items-center justify-center py-2 px-3 bg-gray-100 rounded-3xl min-w-[80px] gap-1"
          >
            <Text className="text-sm font-medium text-gray-700">Save</Text>
          </Pressable>

          {/* Next */}
          <Pressable
            onPress={() => handlePress("Notes")}
            disabled={!videoCompleted}
            className={`flex-row items-center justify-center py-2 px-3 rounded-3xl min-w-[80px] gap-1 ${
              videoCompleted ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <Text className={`text-sm font-medium ${
              videoCompleted ? 'text-white' : 'text-gray-500'
            }`}>Notes</Text>
          </Pressable>
        </View>
      </View>

      {/* Spacer for home bar */}
      <View style={{ height: insets.bottom }} className="bg-gray-50" />
    </View>
  );
};

export default FooterNav;