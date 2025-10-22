import React from "react";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface HeaderSixthProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

const HeaderSixth: React.FC<HeaderSixthProps> = ({ title, subtitle, onBack }) => {
  return (
    <View className="bg-white border-b border-gray-100">
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">

        <View className="flex-1 ml-2 mt-1">
          <Text className="text-base mb-1 font-bold">{title}</Text>
          {subtitle && <Text className="text-xs text-gray-600">{subtitle}</Text>}
        </View>
        <View className="p-1">
          <Icon name="more-vert" size={24} color="#000" />
        </View>
      </View>
    </View>
  );
};

export default HeaderSixth;
