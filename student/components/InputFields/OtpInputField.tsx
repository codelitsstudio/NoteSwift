import { router } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
}

const { width } = Dimensions.get("window");

export default function OtpInput({ length = 6, onComplete }: OtpInputProps) {
  const [code, setCode] = useState("");
  const hiddenInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (code.length === length) {
      onComplete(code);
      router.push("/onboarding/Login/Success"); // dev fallback navigation
    }
  }, [code, length, onComplete]);

  const currentIndex = code.length < length ? code.length : length - 1;

  const renderCircles = () => {
    const digits = code.split("");

    return Array.from({ length }).map((_, i) => {
      const isActive = i === currentIndex;

      return (
        <View key={i} style={styles.otpCircle}>
          {digits[i] ? (
            <Text style={styles.otpText}>{digits[i]}</Text>
          ) : isActive ? (
            <BlinkingCursor />
          ) : null}
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => hiddenInputRef.current?.focus()}
        style={styles.touchable}
      >
        {renderCircles()}
        <TextInput
          ref={hiddenInputRef}
          value={code}
          onChangeText={(text) => {
            const filtered = text.replace(/[^0-9]/g, "").slice(0, length);
            setCode(filtered);
          }}
          keyboardType="number-pad"
          maxLength={length}
          autoFocus
          caretHidden
          style={styles.hiddenInput}
          textContentType={Platform.OS === "ios" ? "oneTimeCode" : "none"}
          importantForAutofill="yes"
          autoComplete="sms-otp"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  touchable: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    width: "auto",
  },
  otpCircle: {
    width: width < 360 ? 44 : 56,
    height: width < 360 ? 44 : 56,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#1E1E1E",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  otpText: {
    fontSize: width < 360 ? 18 : 24,
    fontWeight: "bold",
    color: "#1E1E1E",
    textAlign: "center",
  },
  hiddenInput: {
    position: "absolute",
    width: 0,
    height: 0,
    opacity: 0,
  },
});

const BlinkingCursor = () => {
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [blinkAnim]);

  return (
    <Animated.View
      style={{
        width: 2,
        height: 18,
        backgroundColor: "#1E1E1E",
        opacity: blinkAnim,
      }}
    />
  );
};
