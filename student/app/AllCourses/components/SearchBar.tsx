import React from "react";
import { View, TextInput } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder = "Search..." }: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-3xl px-3 mb-2 mt-2 py-2">
      <MaterialIcons name="search" size={20} color="#6B7280" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className="flex-1 ml-2 text-gray-900"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <MaterialIcons
          name="clear"
          size={20}
          color="#6B7280"
          onPress={() => onChangeText("")}
        />
      )}
    </View>
  );
}