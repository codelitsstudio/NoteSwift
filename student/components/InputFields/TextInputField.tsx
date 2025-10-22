import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardTypeOptions,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface TextInputFieldProps {
  label: string;
  placeholder: string;
  secure?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
}

const { width } = Dimensions.get("window");

export default function TextInputField({
  label,
  placeholder,
  secure = false,
  value,
  onChangeText,
  keyboardType = "default",
  maxLength,
}: TextInputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Animated value for border color
  const borderAnim = useRef(new Animated.Value(0)).current; // 0 = unfocused, 1 = focused

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused || value.length > 0 ? 1 : 0,
      duration: 150, // smooth transition duration in ms
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, borderAnim]);

  // Interpolating border color
  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#D1D5DB", "#3B82F6"], // gray -> customBlue
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Animated.View
        style={[
          styles.inputWrapper,
          { borderColor }, // Animated border color
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secure && !showPassword}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {secure && (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
            <MaterialIcons
              name={showPassword ? "visibility-off" : "visibility"}
              size={22}
              color="#3B82F6"
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    color: "#4B5563",
    fontWeight: "600",
    marginBottom: 6,
    fontSize: width < 360 ? 13 : 14,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: width < 360 ? 12.5 : 14,
    color: "#111827",
  },
});
