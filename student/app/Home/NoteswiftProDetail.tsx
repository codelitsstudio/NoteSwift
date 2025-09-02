import React, { useState, useCallback } from "react";
import { View, ScrollView } from "react-native";
import ProHeader from "./Components/ProHeader";

import FeatureCard from "./Components/FeatureCard";
import SubscribeButton from "../../components/Buttons/SubscribeButton";

export default function NoteswiftProDetail() {
  const [activeTab, setActiveTab] = useState<"premium" | "plus">("premium");
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

  const plusPlans = [
    {
      id: "plus-monthly",
      title: "Monthly",
      price: "$19.99/month",
      description: "Premium + Live Classes + Exclusive Mentorship.",
      icon: "cast-for-education",
    },
    {
      id: "plus-yearly",
      title: "Yearly",
      price: "$179.99/year",
      description: "Save more with a yearly Pro Plus subscription.",
      icon: "school",
    },
  ];

  const plans = activeTab === "premium" ? premiumPlans : plusPlans;

  return (
    <View className="flex-1 bg-white">
      {/* Tabs */}
      <ProHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Scrollable Content */}
      <ScrollView
        className="p-5"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Big Icon + Title + Description */}
     

        {/* Subscription Plans */}
        {plans.map((plan) => (
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
