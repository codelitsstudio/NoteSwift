import React, { useState, useRef } from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  GestureResponderEvent,
} from 'react-native';

interface ButtonFourthProps extends TouchableOpacityProps {
  label: string;
  type?: 'live' | 'upcoming';
  onPress: (e: GestureResponderEvent) => void | Promise<any>;
  spinnerDelay?: number;
}

export default function ButtonFourth({
  label,
  onPress,
  type = 'live',
  disabled,
  spinnerDelay = 200,
  ...props
}: ButtonFourthProps) {
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | null>(null);
  const isDisabled = disabled || loading;

  const handlePress = async (e: GestureResponderEvent) => {
    if (isDisabled) return;

    timerRef.current = setTimeout(() => {
      setLoading(true);
    }, spinnerDelay) as any;

    try {
      const result = onPress(e);
      if (result && typeof (result as any).then === 'function') {
        await result;
      }
    } catch (err) {
      // swallow errors
    } finally {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setLoading(false);
    }
  };

  const bgColor = type === 'live' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <TouchableOpacity
      {...props}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.7}
      className={`${bgColor} px-4 py-2 rounded-full self-start`}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text className="text-white font-semibold text-xs">{label}</Text>
      )}
    </TouchableOpacity>
  );
}
