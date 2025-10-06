// app/components/ProHeader.tsx
import React from "react";
import { View, Text, Pressable, SafeAreaView, Image } from "react-native";
import { useRouter } from "expo-router";

export default function ProHeader() {
  const router = useRouter();

  return (
    <SafeAreaView className="bg-white" style={{ flex: 0 }}>
      <View className="bg-white">
        {/* Top Row: Close Button + NoteSwift Pro Tab */}
        <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-6">
          <Pressable
            onPress={() => router.back()}
            android_ripple={{ color: "#e0e7ff", borderless: true }}
          >
            <Text style={{ fontSize: 28 }}>✕</Text>
          </Pressable>

          <View className="flex-row">
            {/* NoteSwift Pro Tab - Always Active */}
            <Pressable
              className="px-4 py-2 rounded-md"
              style={{
                backgroundColor: "#3B82F6",
              }}
              android_ripple={{ color: "#e0e7ff" }}
            >
              <Text
                className="font-semibold text-white"
                style={{
                  color: "#fff",
                }}
              >
                NoteSwift Pro
              </Text>
            </Pressable>
          </View>

          <View style={{ width: 28 }} />
        </View>

        {/* Illustration Image */}
        <View className="items-center mb-2 mt-4 px-6">
          <Image
            source={require("../../../assets/images/proo.png")}
            style={{ width: 250, height: 250, resizeMode: "cover" }}
          />
          {/* Text Below Image */}
          <Text
            className="mt-4 mx-2 text-lg font-semibold text-gray-900"
            style={{ alignSelf: "flex-start" }}
          >
            Choose your plan below:
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
