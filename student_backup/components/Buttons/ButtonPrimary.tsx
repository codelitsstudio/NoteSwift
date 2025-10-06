import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  GestureResponderEvent,
} from "react-native";

interface ButtonPrimaryProps {
  title: string;
  /** 
   * If your handler returns a Promise, ButtonPrimary will
   * show a spinner until it resolves or rejects. 
   */
  onPress: (e: GestureResponderEvent) => void | Promise<any>;
  disabled?: boolean;
}

export default function ButtonPrimary({
  title,
  onPress,
  disabled = false,
}: ButtonPrimaryProps) {
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
      // you might choose to surface the error here,
      // or just swallow it and let the caller Alert.alert
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.7}
      className="w-full bg-customBlue py-4 rounded-full items-center mb-4 mt-2"
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text className="text-white text-xl font-semibold">{title}</Text>
      )}
    </TouchableOpacity>
  );
}
