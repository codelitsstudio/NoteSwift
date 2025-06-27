import React from "react";
import {
  View,
  TextInput,
  Text,
  KeyboardTypeOptions,
} from "react-native";

interface TextInputFieldProps {
  label: string;
  placeholder: string;
  secure?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number; 
}

export default function TextInputField({
  label,
  placeholder,
  secure = false,
  value,
  onChangeText,
  keyboardType = "default",
  maxLength, 
}: TextInputFieldProps) {
  return (
    <View className="w-full mb-4 mt-2">
      <Text className="text-gray-600 font-medium mb-1">{label}</Text>
<TextInput
  className="border border-gray-200 rounded-lg mt-2 px-4 py-3 text-gray-900 bg-gray-50 text-lg"
    style={{ fontSize: 14}}
placeholder={placeholder}
  placeholderTextColor="#94A3B8"
  secureTextEntry={secure}
  value={value}
  onChangeText={onChangeText}
  keyboardType={keyboardType}
  maxLength={maxLength} 
/>

    </View>
  );
}
