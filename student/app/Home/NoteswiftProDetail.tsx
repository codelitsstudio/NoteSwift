import React, { useState, useCallback } from "react";
import { View, ScrollView, Text, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
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
        {/* Hero Section */}
        <View className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100">
          <View className="flex-row items-center mb-4">
            <MaterialIcons name="workspace-premium" size={32} color="#2563eb" />
            <Text className="text-2xl font-bold text-blue-900 ml-3">NoteSwift Pro</Text>
          </View>
          <Text className="text-gray-700 text-base leading-6 mb-4">
            Elevate your learning experience with exclusive access to premium courses,
            live interactive classes, and comprehensive study materials designed by expert educators.
          </Text>
          <View className="flex-row items-center">
            <MaterialIcons name="verified" size={20} color="#2563eb" />
            <Text className="text-blue-700 font-semibold ml-2">Trusted by 10,000+ students</Text>
          </View>
        </View>

        {/* Premium Features Grid */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Premium Features</Text>
          <View className="grid grid-cols-2 gap-4">
            <View className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <MaterialIcons name="live-tv" size={28} color="#2563eb" />
              <Text className="text-gray-900 font-semibold mt-2">Live Classes</Text>
              <Text className="text-gray-600 text-sm mt-1">Interactive sessions with expert instructors</Text>
            </View>
            <View className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <MaterialIcons name="library-books" size={28} color="#2563eb" />
              <Text className="text-gray-900 font-semibold mt-2">Study Materials</Text>
              <Text className="text-gray-600 text-sm mt-1">Comprehensive notes and resources</Text>
            </View>
            <View className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <MaterialIcons name="assessment" size={28} color="#2563eb" />
              <Text className="text-gray-900 font-semibold mt-2">Practice Tests</Text>
              <Text className="text-gray-600 text-sm mt-1">Mock exams and assessments</Text>
            </View>
            <View className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <MaterialIcons name="analytics" size={28} color="#2563eb" />
              <Text className="text-gray-900 font-semibold mt-2">Progress Tracking</Text>
              <Text className="text-gray-600 text-sm mt-1">Detailed performance analytics</Text>
            </View>
          </View>
        </View>

        {/* Why Choose Pro Section */}
        <View className="mb-6 p-5 bg-blue-50 rounded-2xl border border-blue-100">
          <Text className="text-lg font-bold text-blue-900 mb-3">Why Choose Pro?</Text>
          <View className="space-y-3">
            <View className="flex-row items-start">
              <MaterialIcons name="check-circle" size={20} color="#2563eb" />
              <Text className="text-gray-800 flex-1 ml-3 leading-5">
                Access to all premium courses and specialized learning paths
              </Text>
            </View>
            <View className="flex-row items-start">
              <MaterialIcons name="check-circle" size={20} color="#2563eb" />
              <Text className="text-gray-800 flex-1 ml-3 leading-5">
                Live interactive classes with certified educators
              </Text>
            </View>
            <View className="flex-row items-start">
              <MaterialIcons name="check-circle" size={20} color="#2563eb" />
              <Text className="text-gray-800 flex-1 ml-3 leading-5">
                Unlimited practice tests and mock examinations
              </Text>
            </View>
            <View className="flex-row items-start">
              <MaterialIcons name="check-circle" size={20} color="#2563eb" />
              <Text className="text-gray-800 flex-1 ml-3 leading-5">
                Priority support and personalized learning recommendations
              </Text>
            </View>
          </View>
        </View>

        {/* Description Text */}
        <View className="mb-6">
          <Text className="text-sm text-gray-600 leading-6 text-center">
            Join thousands of successful students who have transformed their academic performance with NoteSwift Pro.
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