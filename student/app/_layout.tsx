import React, { useEffect, useRef, useState } from "react";
import { enableScreens } from "react-native-screens";
import { Animated, View, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import { Stack, router, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { toastConfig } from './ToastConfig';
import "react-native-reanimated";
import "../global.css";

import Header from "../components/Headers/Header";
import HeaderTwo from "../components/Headers/HeaderTwo";
import HeaderThree from "@/components/Headers/HeaderThree";
import SplashScreen from "../components/Splash/SplashScreen";
import { OfflineBanner } from "../components/Container/OfflineBanner";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useNavStore } from "../stores/navigationStore";
import { useAuthStore } from "../stores/authStore";



cssInterop(AntDesign, { className: { target: "style" } });
cssInterop(MaterialIcons, { className: { target: "style" } });

enableScreens();

export default function RootLayout() {
  // Network status monitoring
  const isOnline = useNetworkStatus();
  
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showSplash, setShowSplash] = useState(true);

  // Authentication protection
  const { isLoggedIn, user } = useAuthStore();
  const segments = useSegments();

  // Strict authentication middleware
  useEffect(() => {
    if (!loaded || showSplash) return;

    const isOnboardingRoute = segments[0] === 'onboarding';
    const isMainApp = ['Home', 'Learn', 'Test', 'Ask', 'More', 'Notification', 'Screens', 'Lesson'].includes(segments[0]);

    // CRITICAL: If user is logged in and trying to access onboarding routes
    if (isLoggedIn && user && isOnboardingRoute) {
      console.warn('🚫 BLOCKED: Authenticated user trying to access onboarding screens');
      // Use replace to prevent navigation stack issues
      router.replace('/Home/HomePage');
      return;
    }

    // If user is not logged in and trying to access protected routes
    if (!isLoggedIn && isMainApp) {
      console.warn('🚫 BLOCKED: Unauthenticated user trying to access protected routes');
      // Use replace to prevent navigation stack issues
      router.replace('/onboarding/Login/login');
      return;
    }
  }, [isLoggedIn, user, segments, loaded, showSplash]);


  useEffect(() => {
    const prepare = async () => {
      try {
        if (!loaded) return;
        await new Promise(res => setTimeout(res, 500));
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start(async () => {
          setShowSplash(false);
        });
      } catch (e) {
        console.warn(e);
      }
    };
    prepare();
  }, [loaded, fadeAnim]);

  const { prevTab, currentTab, isBackNavigation } = useNavStore();

  if (!loaded) {
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
                    let animation: "slide_from_right" | "slide_from_left" | "fade" = "slide_from_right";

                    // Simplified animation logic for register flow
                    const routeName = route.name;
                    
                    // CRITICAL: Disable gestures for onboarding screens when user is authenticated
                    const isOnboardingScreen = routeName.startsWith("onboarding");
                    const shouldDisableGestures = isOnboardingScreen && isLoggedIn && user;

                    if (routeName === "onboarding/Register/registerEmail") {
                      animation = isBackNavigation ? "slide_from_left" : "slide_from_right";
                      // Use immediate cleanup instead of setTimeout to prevent lag
                      if (isBackNavigation) {
                        useNavStore.getState().setBackNavigation(false);
                      }
                    }
                    else if (routeName === "onboarding/Login/login") {
                      animation = "slide_from_left";
                    }
                    else if (routeName === "onboarding/Register/emailVerify") {
                      animation = "slide_from_right";
                    }
                    else if (mainTabs.includes(prevTab) && mainTabs.includes(currentTab)) {
                      // Check if we're navigating between main tab pages only (not sub-pages)
                      const mainTabPages = [
                        "Home/HomePage", 
                        "Learn/LearnPage", 
                        "Test/TestPage", 
                        "Ask/AskPage", 
                        "More/MorePage"
                      ];
                      
                      // Only use fade for direct main tab navigation
                      if (mainTabPages.includes(routeName)) {
                        animation = "fade";
                      } else {
                        // Sub-pages use normal slide animation
                        animation = "slide_from_right";
                      }
                    }

                    return {
                      animation,
                      animationDuration: animation === "fade" ? 120 : 200, // Super fast fade, normal speed for slides
                      gestureEnabled: shouldDisableGestures ? false : !routeName.startsWith("onboarding"),
                      gestureDirection: "horizontal",
                      contentStyle: { backgroundColor: "transparent" },
                    };
                  }}
                >
                  {/* Main Screens with Header */}
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="Home/HomePage" options={{ header: () => <Header /> }} />
                  <Stack.Screen name="Learn/LearnPage" options={{ header: () => <Header /> }} />
                  <Stack.Screen name="Test/TestPage" options={{ header: () => <Header /> }} />
                  <Stack.Screen name="Ask/AskPage" options={{ header: () => <Header /> }} />
                  <Stack.Screen name="More/MorePage" options={{ header: () => <Header /> }} />

                  {/* Detail Screens with HeaderTwo */}
                  <Stack.Screen name="Learn/ScienceSubjectPage" options={{ header: () => <HeaderTwo /> }} />
                  <Stack.Screen name="Learn/ScienceChapterPage" options={{ header: () => <HeaderTwo /> }} />
                  <Stack.Screen 
                    name="Home/Components/PackageDetails" 
                    options={{ 
                      header: () => <HeaderTwo title="Package Details" />, 
                    }} 
                  />
                  


                  {/* Special Screens */}
                  <Stack.Screen name="Home/NoteswiftProDetail" options={{ headerShown: false }} />
                  <Stack.Screen name="Screens/subscriptionManagement" options={{ header: () => <HeaderThree /> }} />
                  <Stack.Screen name="Screens/renewSubscription" options={{ header: () => <HeaderThree /> }} />
                  <Stack.Screen
                    name="Notification/NotificationPage"
                    options={{ header: () => <HeaderThree title="Notifications" /> }}
                  />
                <Stack.Screen
                    name="AllCourses/AllCoursesPage"
                    options={{ header: () => <HeaderThree title="All Courses" /> }}
                  />


                  {/* Dynamic Routes */}
                  <Stack.Screen name="Learn/[chapter]" options={{ headerShown: false }} />
                  <Stack.Screen name="Lesson/[lesson]" options={{ headerShown: false }} />

                  {/* Onboarding Screens WITHOUT Header */}
                  <Stack.Screen name="onboarding/Login/login" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/Login/OTP" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/Register/register" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/Register/address" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/Register/registerNumber" options={{ headerShown: false }} />

                  <Stack.Screen name="onboarding/Register/registerEmail" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/Register/OTP" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/Register/emailVerify" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/Register/PasswordPage" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/Login/OnboardingPage" options={{ headerShown: false }} />
                  <Stack.Screen name="ProDashboard/DashboardHome" options={{ headerShown: false }} />
                  <Stack.Screen name="ProDashboard/MyPackages" options={{ headerShown: false }} />
                  <Stack.Screen name="ProDashboard/PaymentHistory" options={{ headerShown: false }} />
                  <Stack.Screen name="ProDashboard/AddMorePackages" options={{ headerShown: false }} />
                  <Stack.Screen name="ProDashboard/AccountSettings" options={{ headerShown: false }} />
                  <Stack.Screen name="Home/ProMarketplace" options={{ headerShown: false }} />
                  <Stack.Screen name="Home/ProCheckout" options={{ headerShown: false }} />
                  <Stack.Screen name="Profile/ProfilePage" options={{ headerShown: false }} />
                  <Stack.Screen name="Settings/SettingsPage" options={{ headerShown: false }} />
                  <Stack.Screen name="AppInfo/AboutApp" options={{ headerShown: false }} />
                  <Stack.Screen name="QuickAccess/Downloads" options={{ headerShown: false }} />
                  <Stack.Screen name="QuickAccess/MyHistory" options={{ headerShown: false }} />
                  <Stack.Screen name="QuickAccess/MyDoubts" options={{ headerShown: false }} />
                  <Stack.Screen name="QuickAccess/MyBatch" options={{ headerShown: false }} />
                  <Stack.Screen name="QuickAccess/Leaderboard" options={{ headerShown: false }} />
                  <Stack.Screen name="QuickAccess/MyRank" options={{ headerShown: false }} />
                  <Stack.Screen name="QuickAccess/Bookmarks" options={{ headerShown: false }} />


                  <Stack.Screen name="Lesson/LessonDetail/NotesAndReadable" options={{ headerShown: false }} />
                  <Stack.Screen name="Settings/ReportIssue" options={{ headerShown: false }} />
                </Stack>

                {/* Offline Banner */}
                <OfflineBanner isOffline={!isOnline} />

              
              <Toast config={toastConfig} />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </Animated.View>
      )}
    </View>
  );
}