import React, { useState, useCallback } from "react";
import { View, ScrollView, Text, StatusBar, Platform } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import ProHeader from "./Components/ProHeader";
import FeatureCard from "./Components/FeatureCard";
import SubscribeButton from "../../components/Buttons/SubscribeButton";

export default function NoteswiftProDetail() {
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");

  const handleSelectPlan = useCallback((id: string) => {
    // Always keep the pro plan selected - can't deselect
    setSelectedPlan("pro");
  }, []);

  const premiumPlans = [
    {
      id: "pro",
      title: "Activate NoteSwift Pro",
      price: "Choose Packages Next",
      description: "Unlock paid packages and premium features",
      icon: "school",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
            
      {/* Header */}
      <ProHeader />

      {/* Step Indicator */}
      <View className="flex-row justify-center items-center mt-4 mb-4 px-5">
        <View className="w-8 h-8 rounded-full items-center justify-center bg-blue-500">
          <Text className="text-sm font-bold text-white">1</Text>
        </View>
        <View className="w-8 h-0.5 mx-1 bg-gray-300" />
        <View className="w-8 h-8 rounded-full items-center justify-center bg-gray-300">
          <Text className="text-sm font-bold text-gray-600">2</Text>
        </View>
      </View>

      {/* Scrollable Content with proper bottom padding */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ 
          paddingTop: 20,
          paddingBottom: 100  // Add padding to account for footer height
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Pro Details Section */}
        <View className="mb-5 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <Text className="text-lg font-bold text-blue-900 mb-2">Why Go Pro?</Text>
          <View className="mb-2 flex-row items-start">
            <Text className="text-blue-600 font-bold mr-2">•</Text>
            <Text className="text-gray-800 flex-1">Unlock all paid packages and premium content</Text>
          </View>
          <View className="mb-2 flex-row items-start">
            <Text className="text-blue-600 font-bold mr-2">•</Text>
            <Text className="text-gray-800 flex-1">Attend live classes with expert instructors</Text>
          </View>
        </View>

        {/* Description Text */}
        <View className="mb-1">
          <Text className="text-sm text-gray-600 leading-5">
            Access exclusive study materials, live classes, and personalized guidance.{"\n"}
          </Text>
        </View>

        {/* Subscription Plans */}
        <View>
          {premiumPlans.map((plan) => (
            <FeatureCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan === plan.id}
              onSelect={handleSelectPlan}
            />
          ))}
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View className="absolute bottom-6 left-0 right-0">
        <SubscribeButton selectedPlan={selectedPlan} />
      </View>
    </SafeAreaView>
  );
}