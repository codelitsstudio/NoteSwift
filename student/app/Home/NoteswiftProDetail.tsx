import React, { useState, useCallback } from "react";
import { View, ScrollView } from "react-native";
import ProHeader from "./Components/ProHeader";

import FeatureCard from "./Components/FeatureCard";
import SubscribeButton from "../../components/Buttons/SubscribeButton";

export default function NoteswiftProDetail() {
  const [selectedPlan, setSelectedPlan] = useState<string>("monthly");

  const handleSelectPlan = useCallback((id: string) => {
    setSelectedPlan(id);
  }, []);

  const premiumPlans = [
      {
      id: "trial",
      title: "Free Trial",
      price: "$0 / 7 days",
      description: "Try premium free for 7 days. Cancel anytime.",
      icon: "auto-stories",
    }, {
      id: "monthly",
      title: "Monthly",
      price: "$9.99/month",
      description: "Advanced notes, practice exams, certifications & support.",
      icon: "menu-book",
    },
    {
      id: "yearly",
      title: "Yearly",
      price: "$99.99/year",
      description: "Full year of Premium benefits with family sharing.",
      icon: "school",
    },
 
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <ProHeader />

      {/* Scrollable Content */}
      <ScrollView
        className="p-5"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Big Icon + Title + Description */}
     

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
