import React, { useState, useCallback } from "react";
import { View, ScrollView, Text } from "react-native";
import ProHeader from "./Components/ProHeader";
import FeatureCard from "./Components/FeatureCard";
import SubscribeButton from "../../components/Buttons/SubscribeButton";

export default function NoteswiftProDetail() {
  const [selectedPlan, setSelectedPlan] = useState<string>("free");

  const handleSelectPlan = useCallback((id: string) => {
    setSelectedPlan(id);
  }, []);

  const premiumPlans = [
    {
      id: "free",
      title: "Free Trial",
      price: "Rs 0.00",
      description: "Limited free courses for 7 days",
      icon: "auto-stories",
    },
    {
      id: "pro",
      title: "Activate NoteSwift Pro",
      price: "Choose Packages Next",
      description: "Unlock paid packages and premium features",
      icon: "school",
    },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <ProHeader />

      {/* Step Indicator */}
      <View className="flex-row justify-center items-center mb-6 px-5">
        <View className="w-8 h-8 rounded-full items-center justify-center bg-blue-500">
          <Text className="text-sm font-bold text-white">1</Text>
        </View>
        <View className="w-8 h-0.5 mx-1 bg-gray-300" />
        <View className="w-8 h-8 rounded-full items-center justify-center bg-gray-300">
          <Text className="text-sm font-bold text-gray-600">2</Text>
        </View>
        <View className="w-8 h-0.5 mx-1 bg-gray-300" />
        <View className="w-8 h-8 rounded-full items-center justify-center bg-gray-300">
          <Text className="text-sm font-bold text-gray-600">3</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="p-5"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Subscription Plans */}
        {premiumPlans.map((plan) => (
          <FeatureCard
            key={plan.id}
            plan={plan}
            selected={selectedPlan === plan.id}
            onSelect={handleSelectPlan}
          />
        ))}
      </ScrollView>

      {/* Sticky Footer */}
      <View className="absolute bottom-0 left-0 right-0">
        <SubscribeButton selectedPlan={selectedPlan} />
      </View>
    </View>
  );
}