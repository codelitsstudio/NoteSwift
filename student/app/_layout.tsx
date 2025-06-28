import React from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";
import "react-native-reanimated";
import "../global.css";

import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { View, ActivityIndicator } from "react-native";

cssInterop(AntDesign, { className: { target: "style" } });
cssInterop(MaterialIcons, { className: { target: "style" } });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Show splash while fonts load
  if (!fontsLoaded && !fontError) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ contentStyle: { backgroundColor: "transparent" } }}>
          {/* Home / dashboard */}
          <Stack.Screen
            name="index"
            options={{ headerShown: false }}
          />
          {/* Login */}
          <Stack.Screen
            name="onboarding/Login/login"
            options={{ headerShown: false, animation: "fade" }}
          />
          <Stack.Screen
            name="onboarding/Login/OTP"
            options={{ headerShown: false, animation: "fade" }}
          />
                 <Stack.Screen
            name="onboarding/Login/Success"
            options={{ headerShown: false, animation: "fade" }}
          />
                           <Stack.Screen
            name="onboarding/Register/register"
            options={{ headerShown: false, animation: "fade" }}
          />
                                  <Stack.Screen
            name="onboarding/Register/address"
            options={{ headerShown: false, animation: "fade" }}
          />
                                         <Stack.Screen
            name="onboarding/Register/registerNumber"
            options={{ headerShown: false, animation: "fade" }}
          />
                                             <Stack.Screen
            name="onboarding/Register/OTP"
            options={{ headerShown: false, animation: "fade" }}
          />
        </Stack>
        
        
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
