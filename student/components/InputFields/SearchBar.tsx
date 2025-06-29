// components/InputFields/SearchBar.tsx
import React from "react";
import { View, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

const SearchBar: React.FC<Props> = ({ value, onChangeText }) => {
  return (
    <View
      className="flex-row items-center bg-white px-4 py-1"
      style={{
        borderRadius: 20,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 0.5,
      }}
    >
      <MaterialIcons name="search" size={24} color="#8c8c8c" />
      <TextInput
        placeholder="Search enrolled classes..."
        placeholderTextColor="#999999"
        value={value}
        onChangeText={onChangeText}
        className="ml-3 text-[14px] flex-1 text-[#292E45]"
      />
    </View>
  );
};

export default SearchBar;
