// student/app/Home/HomePage.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, BackHandler } from "react-native";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import { useFocusEffect } from '@react-navigation/native';

import FeaturedClasses from "./Components/FeaturedDemoClasses";
import QuickAccess from "../../components/Container/QuickAccess";
import UpcomingCourses from "./Components/UpcomingCourses";
import TopicsSection from "../../components/Container/TopicSection";
import NoteswiftProCard from "../../components/Container/NoteswiftProCard";
import RecommendationClasses from "./Components/RecommendedClasses";
import FreeCourses from "./Components/FreeCourses";
import PrimaryNav from "../../components/Navigation/PrimaryNav";
import { OfflineScreen } from "../../components/Container/OfflineScreen";

import { CourseNotificationSheet } from '../../components/Picker/CourseNotificationSheet';
import { useCourseStore } from '../../stores/courseStore';
import { useAuthStore } from '../../stores/authStore';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import SearchBar from '../../components/InputFields/SearchBar';

export default function HomePage() {
  // Network status monitoring
  const isOnline = useNetworkStatus();
  
  const router = useRouter();
  const params = useSearchParams();
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { user, isLoggedIn } = useAuthStore();
  const { 
    featuredCourse,
    fetchFeaturedCourse, 
    fetchUserEnrollments, 
    checkAndShowPopup,
    enrollInCourse,
    isEnrolled
  } = useCourseStore();

  // Handle login success toast
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

  // Initialize data when screen focuses or user logs in
  useFocusEffect(
    React.useCallback(() => {
      if (isLoggedIn && user && !isInitialized) {
        initializeHomePage();
      }
    }, [isLoggedIn, user, isInitialized])
  );

  // Initialize homepage data and check popup visibility
  const initializeHomePage = async () => {
    if (!user || isInitialized) return;

    try {
      const userId = user.id || (user as any)._id;
      if (!userId) {
        throw new Error('User ID is missing');
      }
      
      console.log('Initializing HomePage for user:', userId);
      
      // Reset notification state before initializing
      setNotificationVisible(false);
      
      // Fetch both featured course and user enrollments
      await Promise.all([
        fetchFeaturedCourse(),
        fetchUserEnrollments(userId)
      ]);

      console.log('Both API calls completed, now checking popup...');

      // Check if we should show the popup
      const shouldShowPopup = checkAndShowPopup(userId);
      console.log('Should show popup:', shouldShowPopup);

      if (shouldShowPopup) {
        // Show popup after a short delay for better UX
        setTimeout(() => {
          console.log('Setting notification visible to true');
          setNotificationVisible(true);
        }, 1500);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing HomePage:', error);
      setIsInitialized(true); // Mark as initialized even on error to prevent retry loops
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error",
        text2: "Failed to load course data",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
    }
  };

  // Handle course enrollment (legacy support)
  // Handle popup close
  const handleClosePopup = () => {
    console.log('handleClosePopup called');
    setNotificationVisible(false);
  };

  // Reset initialization when user changes
  useEffect(() => {
    if (user?.id) {
      setIsInitialized(false);
      setNotificationVisible(false); // Reset notification state
    }
  }, [user?.id]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      setNotificationVisible(false);
    };
  }, []);

  // Handle hardware back button to prevent going back to onboarding/registration
  useEffect(() => {
    const handleBackPress = () => {
      // For HomePage, back button should minimize the app instead of navigation
      return false; // Allow default behavior (minimize app)
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => backHandler.remove();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
      className="flex-1 bg-white"
    >
      {/* Show offline screen when no internet */}
      {!isOnline && <OfflineScreen />}
      
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6 flex-1 bg-[#FAFAFA]">
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

          <TopicsSection />
          <NoteswiftProCard />
          <FeaturedClasses />
          <Text className="text-2xl font-bold mb-3 text-gray-900">Quick Access</Text>
          <QuickAccess />
          <RecommendationClasses />
          <FreeCourses />
          <UpcomingCourses />
        </View>
      </ScrollView>

      <PrimaryNav current="Home" />

      {/* Course Notification Sheet */}
      {featuredCourse && (
        <CourseNotificationSheet
          key={`course-sheet-${featuredCourse.id || featuredCourse._id}`}
          visible={notificationVisible}
          onClose={handleClosePopup}
        />
      )}
    </KeyboardAvoidingView>
  );
}