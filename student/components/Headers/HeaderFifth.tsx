import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";

interface HeaderFifthProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

const HeaderFifth: React.FC<HeaderFifthProps> = ({ title, subtitle, onBack }) => {
  return (
        <SafeAreaView edges={["top", "left", "right"]} className="bg-white border-b border-gray-100">
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <TouchableOpacity onPress={onBack} className="p-1">
        <Icon name="close" size={24} color="#000" />
      </TouchableOpacity>

      <View className="flex-1 ml-2">
        <Text className="text-base font-bold">{title}</Text>
        {subtitle && <Text className="text-xs text-gray-600">{subtitle}</Text>}
      </View>

      <Icon name="more-vert" size={24} color="#000" />
    </View>
    </SafeAreaView>
  );
};

export default HeaderFifth;
