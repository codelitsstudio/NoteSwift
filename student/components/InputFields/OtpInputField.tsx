import { router } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
}

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
        <View
          key={i}
          className="w-14 h-14 rounded-full border border-[#1E1E1E] items-center justify-center bg-transparent"
          style={{ marginBottom: 0 ,
             borderWidth: 2
          }}
        >
          {digits[i] ? (
            <Text className="text-[#1E1E1E] text-2xl text-center font-bold">{digits[i]}</Text>
          ) : isActive ? (
            <BlinkingCursor />
          ) : null}
        </View>
      );
    });
  };

  return (
    <View className="items-center">
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => hiddenInputRef.current?.focus()}
        className="flex-row justify-center gap-4"
        style={{ width: "auto" }}
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
          caretHidden={false}
          className="absolute w-0 h-0 opacity-0"
          textContentType={Platform.OS === "ios" ? "oneTimeCode" : "none"}
          importantForAutofill="yes"
          autoComplete="sms-otp"
        />
      </TouchableOpacity>
    </View>
  );
}

// Blinking cursor component
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
