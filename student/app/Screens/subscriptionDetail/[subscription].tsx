// app/Screens/subscriptionDetail/[subscription].tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router"; // Using expo-router

export default function SubscriptionDetail() {
  const router = useRouter(); // Using router.push for navigation
  const { subscription } = useLocalSearchParams(); // Capture the dynamic route parameter

  return (
    <View style={{ padding: 16, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Subscription Detail for {subscription}
      </Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Billing Details</Text>
        <Text style={{ fontSize: 16, marginVertical: 10 }}>Plan: {subscription} Plan</Text>
        <Text style={{ fontSize: 16, marginVertical: 10 }}>Price: $19.00</Text>
      </View>

      <Pressable
        style={{ backgroundColor: "#2563eb", paddingVertical: 12, borderRadius: 8 }}
        onPress={() => router.push("/Screens/renewSubscription")} // Correctly navigate to renew subscription
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 18 }}>Renew Subscription</Text>
      </Pressable>
    </View>
  );
}
