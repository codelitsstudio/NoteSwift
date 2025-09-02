// app/QuickAccess/BookmarksPage.tsx
import React from "react";
import { ScrollView, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const BookmarksPage = () => {
  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="flex-row items-center mb-4">
        <MaterialIcons name="bookmark-outline" size={28} color="#4B5563" />
        <Text className="text-2xl font-bold ml-2">Bookmarks</Text>
      </View>
      <Text className="text-gray-700 mb-2">Saved content:</Text>
      <View className="bg-white p-4 rounded-xl shadow mb-2">
        <Text>• React Native Tutorial</Text>
        <Text>• State Management Guide</Text>
        <Text>• JavaScript Best Practices</Text>
      </View>
    </ScrollView>
  );
};

export default BookmarksPage;
