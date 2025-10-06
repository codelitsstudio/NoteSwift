import React, { useState, useRef } from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  GestureResponderEvent,
} from 'react-native';

interface ButtonThirdProps extends TouchableOpacityProps {
  label: string;
  /**
   * Can be sync or return a Promise.
   */
  onPress: (e: GestureResponderEvent) => void | Promise<any>;
  /**
   * How long (in ms) to wait before showing spinner.
   * Defaults to 200 ms.
   */
  spinnerDelay?: number;
}

export default function ButtonThird({
  label,
  onPress,
  disabled,
  spinnerDelay = 200,
  ...props
}: ButtonThirdProps) {
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | null>(null);
  const isDisabled = disabled || loading;

  const handlePress = async (e: GestureResponderEvent) => {
    if (isDisabled) return;

    // Start a short timer; only when it fires do we show the spinner.
    timerRef.current = setTimeout(() => {
      setLoading(true);
    }, spinnerDelay) as any;

    try {
      const result = onPress(e);
      if (result && typeof (result as any).then === 'function') {
        await result;
      }
    } catch (err) {
      // swallow or rethrow
    } finally {
      // Cancel the timer if it hasn't fired yet
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      // Only hide the spinner if it was shown
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      {...props}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.7}
      className="bg-buttonBlue px-4 py-2 rounded-full self-start"
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text className="text-white font-semibold text-xs">{label}</Text>
      )}
    </TouchableOpacity>
  );
}
