// components/InputFields/SearchBar.tsx
import React, { useCallback } from "react";
import { TouchableOpacity, View, Text, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
};

const SearchBar: React.FC<Props> = React.memo(({
  value = "",
  onChangeText,
  placeholder = "Search for Relevant Classes..."
}) => {
  const router = useRouter();

  const handlePress = useCallback(() => {
    // Use navigate for smoother transitions
    router.navigate("/Search/SearchPage");
  }, [router]);

  // If onChangeText is provided, render as editable input (for inline search)
  if (onChangeText) {
    return (
      <View
        className="flex-row items-center bg-white px-4 py-3"
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
          placeholder={placeholder}
          placeholderTextColor="#999999"
          value={value}
          onChangeText={onChangeText}
          className="ml-3 text-[14px] flex-1 text-[#292E45]"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    );
  }

  // Otherwise, render as pressable button that navigates to search page
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className="flex-row items-center bg-white px-4 py-3"
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
      <Text className="ml-3 text-[14px] flex-1 text-[#999999]">
        {placeholder}
      </Text>
    </TouchableOpacity>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
