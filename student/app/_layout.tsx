import React, { useEffect, useRef, useState } from "react";
import { enableScreens } from "react-native-screens";
import { Animated, View, ActivityIndicator, SafeAreaView } from "react-native";
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
import HeaderTwo from "../components/Headers/HeaderTwo";
import HeaderThree from "@/components/Headers/HeaderThree";
import SplashScreen from "../components/Splash/SplashScreen";
import "react-native-reanimated";
import "../global.css";
import * as SplashScreenExpo from 'expo-splash-screen';

import { useNavStore, navOrder } from "../stores/navigationStore";

cssInterop(AntDesign, { className: { target: "style" } });
cssInterop(MaterialIcons, { className: { target: "style" } });

enableScreens();


export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showSplash, setShowSplash] = useState(true);
  // 1️⃣ Prevent native splash immediately on mount
  useEffect(() => {
    SplashScreenExpo.preventAutoHideAsync().catch(console.warn);
  }, []);

  // 2️⃣ Wait for fonts to load, then fade animation & hide splash
useEffect(() => {
  const prepare = async () => {
    try {
      // Prevent native splash
      await SplashScreenExpo.preventAutoHideAsync();

      // Load fonts
      if (!fontsLoaded) return;

      // Optional delay
      await new Promise(res => setTimeout(res, 500));

      // Fade animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(async () => {
        await SplashScreenExpo.hideAsync();
        setShowSplash(false);
      });
    } catch (e) {
      console.warn(e);
    }
  };

  prepare();
}, [fontsLoaded]);



  const { prevTab, currentTab } = useNavStore();

  const getAnimationDirection = () => {
    if (!prevTab || !currentTab) {
      return "slide_from_right";
    }

    if (prevTab === "Login" && currentTab === "Register") {
      return "slide_from_right";
    }
    if (prevTab === "Register" && currentTab === "Login") {
      return "slide_from_left";
    }

    if (prevTab === "Register" && currentTab === "RegisterAddress") {
      return "slide_from_right";
    }
    if (prevTab === "RegisterAddress" && currentTab === "RegisterNumber") {
      return "slide_from_right";
    }
    if (prevTab === "RegisterNumber" && currentTab === "Home") {
      return "slide_from_right";
    }

    if (prevTab === "RegisterAddress" && currentTab === "Register") {
      return "slide_from_left";
    }
    if (prevTab === "RegisterNumber" && currentTab === "RegisterAddress") {
      return "slide_from_left";
    }

    const mainTabs = ["Home", "Learn", "Test", "Ask", "More"];
    if (mainTabs.includes(prevTab) && mainTabs.includes(currentTab)) {
      const prevIndex = navOrder.indexOf(prevTab);
      const currIndex = navOrder.indexOf(currentTab);
      return currIndex > prevIndex ? "slide_from_right" : "slide_from_left";
    }

    return "slide_from_right";
  };

  if (!fontsLoaded && !fontError) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (

    <View style={{ flex: 1 }}>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
   <Stack
  screenOptions={({ route }) => {
    const mainTabs = ["Home", "Learn", "Test", "Ask", "More"];
    let animation: "slide_from_right" | "slide_from_left" = "slide_from_right";

    // Only apply slide logic for main tabs
    if (mainTabs.includes(prevTab) && mainTabs.includes(currentTab)) {
      const prevIndex = navOrder.indexOf(prevTab);
      const currIndex = navOrder.indexOf(currentTab);

      // REVERSED: forward slides right, backward slides left
      animation = currIndex > prevIndex ? "slide_from_right" : "slide_from_left";
    }

    return {
      animation,
      animationDuration: 300,
      gestureEnabled: !route.name.startsWith("onboarding"),
      gestureDirection: "horizontal",
      contentStyle: { backgroundColor: "transparent" },
    };
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

                {/* Detail Screens with HeaderTwo */}
                <Stack.Screen
                  name="Learn/ScienceSubjectPage"
                  options={{ header: () => <HeaderTwo /> }}
                />
                <Stack.Screen
                  name="Learn/ScienceChapterPage"
                  options={{ header: () => <HeaderTwo /> }}
                />

                {/* Special Screens */}
                <Stack.Screen
                  name="Home/NoteswiftProDetail"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Screens/subscriptionManagement"
                  options={{ header: () => <HeaderThree /> }}
                />
                <Stack.Screen
                  name="Screens/renewSubscription"
                  options={{ header: () => <HeaderThree /> }}
                />

                {/* Dynamic Routes */}
                <Stack.Screen
                  name="Learn/[chapter]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Lesson/[lesson]"
                  options={{ headerShown: false }}
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
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="onboarding/Register/OTP"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="onboarding/Login/OnboardingPage"
                  options={{ headerShown: false }}
                />
              </Stack>
              <Toast config={toastConfig} />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </Animated.View>
      )}
    </View>

  );
}
