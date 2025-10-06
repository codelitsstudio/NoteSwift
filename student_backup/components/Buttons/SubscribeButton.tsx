import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

function SubscribeButton({ selectedPlan }: { selectedPlan: string }) {
  const router = useRouter();

  const handlePress = () => {
    // Navigate to Step 2 (Marketplace) with the selected trial type
    router.push({
      pathname: '/Home/ProMarketplace' as any,
      params: { trialType: selectedPlan }
    });
  };

  return (
    <View className="p-5 bg-white border-t border-gray-200">
      <Pressable
        onPress={handlePress} // Use the handlePress function for navigation
        android_ripple={{ color: "#2563eb" }}
        className="bg-buttonBlue py-4 rounded-3xl items-center"
      >
        <Text className="text-white text-lg font-semibold">Next</Text>
      </Pressable>
      <Text className="text-gray-400 text-center mt-2 mb-3 text-sm">
    One-time payment – no recurring charges.
      </Text>
    </View>
  );
}

export default memo(SubscribeButton);
