// app/QuickAccess/QuickAccess.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { QuickAccessStackParamList } from "../navigation/QuickAccessStack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type AccessItem = {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  screen: keyof QuickAccessStackParamList;
};

const accessItems: AccessItem[] = [
  { label: "My Batch", icon: "group", screen: "MyBatch" },
  { label: "My History", icon: "history", screen: "MyHistory" },
  { label: "My Doubts", icon: "help-outline", screen: "MyDoubts" },
  { label: "Leaderboard", icon: "leaderboard", screen: "Leaderboard" },
  { label: "Courses", icon: "menu-book", screen: "Courses" },
  { label: "My Rank", icon: "emoji-events", screen: "MyRank" },
  { label: "Bookmarks", icon: "bookmark-outline", screen: "Bookmarks" },
  { label: "Downloads", icon: "download", screen: "Downloads" },
];

const QuickAccess: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<QuickAccessStackParamList>>();

  return (
    <View className="bg-white p-4 rounded-xl border border-gray-100">
      <View className="flex-row flex-wrap justify-between">
        {accessItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="w-[22%] mb-4 items-center"
            activeOpacity={0.7}
            onPress={() => navigation.navigate(item.screen)}
          >
            <MaterialIcons name={item.icon} size={28} color="#374151" />
            <Text className="text-[12px] text-center mt-1 text-gray-700">{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default QuickAccess;
