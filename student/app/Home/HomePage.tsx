import React, { useEffect } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import LiveClasses from "./Components/LiveClasses";
import QuickAccess from "../../components/Container/QuickAccess";
import UpcomingCourses from "./Components/UpcomingCourses";
import TopicsSection from "../../components/Container/TopicSection";
import NoteswiftProCard from "../../components/Container/NoteswiftProCard";
import RecommendationClasses from "./Components/RecommendedClasses";
import FreeCourses from "./Components/FreeCourses";

import PrimaryNav from "../../components/Navigation/PrimaryNav";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";

export default function HomePage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("loggedIn") === "true") {
      Toast.show({
        type: "success",
        position: "top",
        text1: "Success",
        text2: "Logged in successfully!",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });

      setTimeout(() => {
        router.replace({ pathname: "/Home/HomePage", params: {} });
      }, 700);
    }
  }, [params, router]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100}} keyboardShouldPersistTaps="handled">
        <View className="px-6 pt-6 flex-1 bg-[#FAFAFA]">

   

          {/* Topics */}
          <TopicsSection />

          {/* Noteswift Pro */}
          <NoteswiftProCard />
       {/* Live Classes */}
          <LiveClasses />
          {/* Quick Access */}
          <Text className="text-2xl font-bold mb-3 text-gray-900">Quick Access</Text>
          <QuickAccess />

       

          {/* Recommendations */}
          <RecommendationClasses />

          {/* Categories */}
          {/* <CategoryGrid /> */}
          <FreeCourses />
             <UpcomingCourses />
        </View>
      </ScrollView>
      <PrimaryNav current="Home" />
    </KeyboardAvoidingView>
  );
}
