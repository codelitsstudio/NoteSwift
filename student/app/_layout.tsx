import React, { useEffect, useRef } from "react";
import { enableScreens } from "react-native-screens";
import { Animated, View, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { toastConfig } from './ToastConfig'; 

import Header from "../components/Headers/Header";
import "react-native-reanimated";
import "../global.css";

import { useNavStore, navOrder } from "../stores/navigationStore";

cssInterop(AntDesign, { className: { target: "style" } });
cssInterop(MaterialIcons, { className: { target: "style" } });

enableScreens();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (fontsLoaded) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [fontsLoaded]);

  const { prevTab, currentTab } = useNavStore();
const isOnboardingScreen = (screenName: string) =>
  screenName.includes("Login") || screenName.includes("Register") || screenName.includes("OTP");

const isSuccessScreen = (screenName: string) =>
  screenName.endsWith("Success");

const getAnimationDirection = () => {
  const prevIndex = navOrder.indexOf(prevTab);
  const currIndex = navOrder.indexOf(currentTab);

  const bothOnboarding = isOnboardingScreen(prevTab) && isOnboardingScreen(currentTab);

  // If the target screen is a Success page, always slide_from_right (right to left)
  if (isSuccessScreen(currentTab)) {
    return "slide_from_right";
  }

  if (currIndex > prevIndex) {
    return bothOnboarding ? "slide_from_left" : "slide_from_right";
  }
  if (currIndex < prevIndex) {
    return bothOnboarding ? "slide_from_right" : "slide_from_left";
  }

  return "fade";
};


  if (!fontsLoaded && !fontError) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <Stack
            screenOptions={{
              animation: getAnimationDirection(),
              gestureEnabled: true,
              gestureDirection: "horizontal",
              contentStyle: { backgroundColor: "transparent" },
            }}
          >
            {/* Main Screens with Header */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="Home/HomePage"
              options={{ header: () => <Header /> }}
            />
            <Stack.Screen
              name="Learn/LearnPage"
              options={{ header: () => <Header /> }}
            />
            <Stack.Screen
              name="Test/TestPage"
              options={{ header: () => <Header /> }}
            />
            <Stack.Screen
              name="Ask/AskPage"
              options={{ header: () => <Header /> }}
            />
            <Stack.Screen
              name="More/MorePage"
              options={{ header: () => <Header /> }}
            />

            {/* Onboarding Screens WITHOUT Header */}
            <Stack.Screen
              name="onboarding/Login/login"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="onboarding/Login/OTP"
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="onboarding/Register/register"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="onboarding/Register/address"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="onboarding/Register/registerNumber"
              options={{
   headerShown: false,
   animation: 'slide_from_right',   
}}
            />
            <Stack.Screen
              name="onboarding/Register/OTP"
              options={{ headerShown: false }}
            />

          </Stack>
            <Toast config={toastConfig}/>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </Animated.View>
  );
}
