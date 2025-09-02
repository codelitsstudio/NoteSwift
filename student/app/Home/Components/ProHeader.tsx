// app/components/ProHeader.tsx
import React from "react";
import { View, Text, Pressable, SafeAreaView, Image } from "react-native";
import { useRouter } from "expo-router";

interface ProHeaderProps {
  activeTab: "premium" | "plus";
  setActiveTab: React.Dispatch<React.SetStateAction<"premium" | "plus">>;
}

export default function ProHeader({ activeTab, setActiveTab }: ProHeaderProps) {
  const router = useRouter();

  const illustrationImages = {
    premium: require("../../../assets/images/Pro.png"),
    plus: require("../../../assets/images/Plus.png"),
  };

  return (
    <SafeAreaView className="bg-white">
      {/* Top Row: Close Button + Tabs */}
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-6">
        <Pressable
          onPress={() => router.back()}
          android_ripple={{ color: "#e0e7ff", borderless: true }}
        >
          <Text style={{ fontSize: 28 }}>✕</Text>
        </Pressable>

        <View className="flex-row">
          {/* Pro Tab */}
          <Pressable
            onPress={() => setActiveTab("premium")}
            className="px-4 py-2 rounded-md mr-2"
            style={{
              backgroundColor: activeTab === "premium" ? "#3B82F6" : "transparent",
            }}
            android_ripple={{ color: "#e0e7ff" }}
          >
            <Text
              className={`font-semibold text-white`}
              style={{
                color: activeTab === "premium" ? "#fff" : "#6B7280",
              }}
            >
              NoteSwift Pro
            </Text>
          </Pressable>

          {/* Plus Tab */}
          <Pressable
            onPress={() => setActiveTab("plus")}
            className="px-4 py-2 rounded-md"
            style={{
              backgroundColor: activeTab === "plus" ? "#3B82F6" : "transparent",
            }}
            android_ripple={{ color: "#e0e7ff" }}
          >
            <Text
              className={`font-semibold text-white`}
              style={{
                color: activeTab === "plus" ? "#fff" : "#6B7280",
              }}
            >
              Plus +
            </Text>
          </Pressable>
        </View>

        <View style={{ width: 28 }} />
      </View>

      {/* Illustration Image */}
      <View className="items-center mb-2 mt-4 px-6">
        <Image
          source={activeTab === "premium" ? illustrationImages.premium : illustrationImages.plus}
          style={{ width: 250, height: 250, resizeMode: "cover" }}
        />
        {/* New Text Below Image */}
 <Text
  className="mt-4 mx-2 text-lg font-semibold text-gray-900"
  style={{ alignSelf: "flex-start" }}
>
  Choose your plan below:
</Text>

      </View>
    </SafeAreaView>
  );
}
