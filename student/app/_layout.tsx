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
import ModuleTestListHeader from "@/components/Headers/TestHeaders/ModuleTestListHeader";
import MCQTestHeader from "@/components/Headers/TestHeaders/MCQTestHeader";
import PDFTestHeader from "@/components/Headers/TestHeaders/PDFTestHeader";
import TestResultHeader from "@/components/Headers/TestHeaders/TestResultHeader";
import AIChatBotHeader from "@/components/Headers/AskHeaders/AIChatBotHeader";
import QuestionGeneratorHeader from "@/components/Headers/AskHeaders/QuestionGeneratorHeader";
import DoubtSolverHeader from "@/components/Headers/AskHeaders/DoubtSolverHeader";
import StudyTipsHeader from "@/components/Headers/AskHeaders/StudyTipsHeader";
import CommunityHeader from "@/components/Headers/AskHeaders/CommunityHeader";
import SupportHeader from "@/components/Headers/AskHeaders/SupportHeader";
import QuestionDetailHeader from "@/components/Headers/AskHeaders/QuestionDetailHeader";
import AllQuestionsHeader from "@/components/Headers/AskHeaders/AllQuestionsHeader";
import SplashScreen from "../components/Splash/SplashScreen";
import { OfflineBanner } from "../components/Container/OfflineBanner";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useNavStore } from "../stores/navigationStore";
import { useAuthStore } from "../stores/authStore";
import { getPushToken, registerPushToken, setupNotificationListener } from '../lib/notificationService';

import HeaderFifth from "@/components/Headers/HeaderFifth";
import AppBlock from "../components/AppBlock";

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

  // Register push notifications when user is authenticated
  useEffect(() => {
    let foregroundSubscription: any = null;
    let responseSubscription: any = null;

    if (isLoggedIn && user && !showSplash) {
      const registerNotifications = async () => {
        try {
          const pushToken = await getPushToken();
          if (pushToken) {
            await registerPushToken(pushToken);
          }
        } catch (error) {
          console.error('Error registering for push notifications:', error);
        }
      };

      registerNotifications();

      // Set up notification listeners
      const listeners = setupNotificationListener();
      foregroundSubscription = listeners.foregroundSubscription;
      responseSubscription = listeners.responseSubscription;
    }

    // Cleanup function
    return () => {
      if (foregroundSubscription) {
        foregroundSubscription.remove();
      }
      if (responseSubscription) {
        responseSubscription.remove();
      }
    };
  }, [isLoggedIn, user, showSplash]);


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
        <AppBlock>
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
                  <Stack.Screen name="More/MorePage" options={{ headerShown: false }} />

                  {/* Detail Screens with HeaderTwo */}
                  <Stack.Screen name="Learn/SubjectPage" options={{ headerShown: false }} />
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
                  <Stack.Screen name="Chapter/[chapter]" options={{ headerShown: false }} />
                  <Stack.Screen name="Chapter/[chapterDetail]" options={{ headerShown: false }} />
                  <Stack.Screen name="Subject/[subject]" options={{ headerShown: false }} />

                  {/* Onboarding Screens WITHOUT Header */}
                  <Stack.Screen name="onboarding/Login/login" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/Register/register" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/Register/address" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/Register/registerNumber" options={{ headerShown: false }} />

                  <Stack.Screen name="onboarding/ForgotPassword/forgotEmail" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/ForgotPassword/forgotOTP" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/ForgotPassword/forgotReset" options={{ headerShown: false }} />

                  <Stack.Screen name="onboarding/Register/registerEmail" options={{ headerShown: false }} />
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


                  <Stack.Screen name="Chapter/ChapterDetail/NotesAndReadable" options={{ headerShown: false }} />
                  <Stack.Screen name="Settings/ReportIssue" options={{ headerShown: false }} />

                  {/* Test Module Screens */}
                  <Stack.Screen name="Test/ModuleTestList" options={{ header: () => <ModuleTestListHeader /> }} />
                  <Stack.Screen name="Test/MCQTest" options={{ header: () => <MCQTestHeader /> }} />
                  <Stack.Screen name="Test/PDFTest" options={{ header: () => <PDFTestHeader /> }} />
                  <Stack.Screen name="Test/TestResult" options={{ header: () => <TestResultHeader /> }} />

                  {/* Ask Module Screens */}
                  <Stack.Screen name="Ask/AIChatBot"  options={{ headerShown: false }}  />
                  <Stack.Screen name="Ask/QuestionGenerator" options={{ header: () => <QuestionGeneratorHeader /> }} />
                  <Stack.Screen name="Ask/AllQuestions" options={{ header: () => <AllQuestionsHeader /> }} />
                  <Stack.Screen name="Ask/DoubtSolver" options={{ header: () => <DoubtSolverHeader /> }} />
                  <Stack.Screen name="Ask/StudyTips" options={{ header: () => <StudyTipsHeader /> }} />
                  <Stack.Screen name="Ask/Community" options={{ header: () => <CommunityHeader /> }} />
                  <Stack.Screen name="Ask/QuestionDetail" options={{ header: () => <QuestionDetailHeader /> }} />
                  <Stack.Screen name="Learn/LiveClass/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="Learn/LiveClass/Room" options={{ headerShown: false }} />

                </Stack>



                {/* Offline Banner */}
                <OfflineBanner isOffline={!isOnline} />

              
              <Toast config={toastConfig} />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </Animated.View>
        </AppBlock>
      )}
    </View>
  );
}