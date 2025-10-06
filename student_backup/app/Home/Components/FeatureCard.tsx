// app/components/FeatureCard.tsx
import React, { useRef } from "react";
import { Pressable, View, Text, Animated } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

function FeatureCard({ plan, selected, onSelect }: any) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={() => onSelect(plan.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      android_ripple={{ color: "#dbeafe", borderless: false }}
    >
      <Animated.View
        style={{ transform: [{ scale }] }}
        className={`border rounded-2xl p-5 mb-4 flex-row items-start space-x-4 ${
          selected ? "border-customBlue bg-blue-50" : "border-gray-300"
        }`}
      >
        <View className="w-10 items-start">
          <Icon
            name={plan.icon}
            size={28}
            color={selected ? "#2563eb" : "gray"}
          />
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-black">
              {plan.title}
            </Text>
            {selected && <Icon name="check-circle" size={22} color="#1d4ed8" />}
          </View>
          <Text className="text-customBlue mt-1">{plan.price}</Text>
          <Text className="text-gray-500 text-sm mt-1">{plan.description}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default React.memo(FeatureCard);
