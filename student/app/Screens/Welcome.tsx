// app/Screens/Welcome.tsx
import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function Welcome() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      {/* Placeholder for abstract image */}
      <Image
        source={require("../../assets/images/demo.png")} // Replace with your actual image path
        className="w-64 h-64 mb-10"
        resizeMode="contain"
      />
      <Text className="text-2xl font-bold text-center mb-3">
        Manage all your{"\n"}Subscriptions with clsFinance
      </Text>

      <Pressable
        onPress={() => router.push("/Screens/subscriptionManagement")}
        className="bg-black w-40 py-4 rounded-full items-center mt-6"
      >
        <Text className="text-white font-semibold text-lg">Get Started</Text>
      </Pressable>
    </View>
  );
}
