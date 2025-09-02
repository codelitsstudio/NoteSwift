import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router"; // Add the router import

function SubscribeButton({ selectedPlan }: { selectedPlan: string }) {
  const router = useRouter(); // Instantiate the router

  const handlePress = () => {
    // Redirect to subscription management after subscription
    router.push("/Screens/subscriptionManagement"); // Change the path if necessary
  };

  return (
    <View className="p-5 bg-white border-t border-gray-200">
      <Pressable
        onPress={handlePress} // Use the handlePress function for navigation
        android_ripple={{ color: "#2563eb" }}
        className="bg-buttonBlue py-4 rounded-2xl items-center"
      >
        <Text className="text-white text-lg font-semibold">Subscribe Now</Text>
      </Pressable>
      <Text className="text-gray-400 text-center mt-2 text-sm">
        Recurring billing – cancel anytime.
      </Text>
    </View>
  );
}

export default memo(SubscribeButton);
