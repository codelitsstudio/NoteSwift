import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function NoteswiftPromo() {
  return (
    <View className="bg-blue-900 rounded-xl p-4">
      <Text className="text-white text-xl font-bold mb-1">Noteswift Pro</Text>
      <Text className="text-gray-200 text-xs mb-3">
        Unlock smarter learning with premium tools.
      </Text>
      <TouchableOpacity className="bg-white px-4 py-2 rounded-lg self-start">
        <Text className="text-blue-900 text-sm font-semibold">Learn More</Text>
      </TouchableOpacity>
    </View>
  );
}
