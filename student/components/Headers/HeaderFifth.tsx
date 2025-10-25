import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

interface HeaderFifthProps {
  title: string;
  onBack?: () => void;
}

const HeaderFifth: React.FC<HeaderFifthProps> = ({ title, onBack }) => {
  return (
    <SafeAreaView edges={["top"]} className="bg-white border-b border-gray-100">
      <View className="flex-row items-center justify-between px-2 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={onBack}
          className="p-1"
          style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
          accessibilityRole="button"
        >
          <MaterialIcons name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>

        <Text className="text-lg font-semibold flex-1 text-center">{title}</Text>

        <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="more-vert" size={24} color="#000" />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HeaderFifth;
