import React, { useRef, useEffect, useState } from "react";
import {
  View,
  TextInput,
  Text,
  KeyboardTypeOptions,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

const { width } = Dimensions.get("window");

// Replace this with your Tailwind customBlue hex color
const customBlue = "#3B82F6";

export default function TextInputField({
  label,
  placeholder,
  secure = false,
  value,
  onChangeText,
  keyboardType = "default",
  maxLength,
}: TextInputFieldProps) {
  const borderAnim = useRef(new Animated.Value(0)).current;
  const [isFocused, setIsFocused] = useState(false);

  const animateTo = (toValue: number) => {
    Animated.timing(borderAnim, {
      toValue,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    if (isFocused || value.trim() !== "") {
      animateTo(1);
    } else {
      animateTo(0);
    }
  }, [isFocused, value]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[
          styles.animatedInputWrapper,
          {
            borderColor: borderAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["transparent", customBlue],
            }),
            backgroundColor: borderAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["#E5E7EB", "#F9FAFB"],
            }),
          },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={secure}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          underlineColorAndroid="transparent"
        />
      </Animated.View>
    </View>
  );
}

// Wrapper component for keyboard avoidance
export function KeyboardAvoidingTextInput(props: TextInputFieldProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingView}
    >
      <TextInputField {...props} />
    </KeyboardAvoidingView>
  );
}

// Alternative: Form wrapper with ScrollView and KeyboardAvoidingView
export function KeyboardAvoidingForm({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.flex1}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 8,
  },
  label: {
    color: "#4B5563",
    fontWeight: "500",
    marginBottom: 8,
    fontSize: width < 360 ? 14 : 15,
  },
  animatedInputWrapper: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  input: {
    fontSize: width < 360 ? 12 : 14,
    color: "#111827",
    paddingVertical: 12,
  },
  keyboardAvoidingView: {
    width: "100%",
  },
  flex1: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});