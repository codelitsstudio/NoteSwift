import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  GestureResponderEvent,
} from "react-native";

interface ButtonSecondaryProps {
  title: string;
  /**
   * Can be sync or return a Promise.
   * If it returns a Promise, the button will show a spinner
   * until it resolves/rejects.
   */
  onPress: (e: GestureResponderEvent) => void | Promise<any>;
  disabled?: boolean;
}

export default function ButtonSecondary({
  title,
  onPress,
  disabled = false,
}: ButtonSecondaryProps) {
  const [loading, setLoading] = useState(false);
  const isDisabled = disabled || loading;

  const handlePress = async (e: GestureResponderEvent) => {
    if (isDisabled) return;
    try {
      const result = onPress(e);
      if (result && typeof (result as any).then === "function") {
        setLoading(true);
        await result;
      }
    } catch (err) {
      // optional: console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.7}
      className="self-center w-3/4 border border-customBlue py-4 rounded-full items-center mb-[50px] mt-2"
    >
      {loading ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : (
        <Text className="text-customBlue text-xl font-semibold">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
