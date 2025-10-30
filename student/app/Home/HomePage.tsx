// student/app/Home/HomePage.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, BackHandler } from "react-native";
import Toast from "react-native-toast-message";
import { useFocusEffect } from '@react-navigation/native';

import FeaturedClasses from "./Components/FeaturedHomepage";
import QuickAccess from "../QuickAccess/QuickAccess";
import UpcomingCourses from "./Components/UpcomingCourses";
import TopicsSection from "../../components/Container/TopicSection";
import NoteswiftProCard from "../../components/Container/NoteswiftProCard";
import RecommendationClasses from "./Components/RecommendedClasses";
import FreeCourses from "./Components/FreeCourses";
import PrimaryNav from "../../components/Navigation/PrimaryNav";
import { OfflineScreen } from "../../components/Container/OfflineScreen";

import { NotificationSheet, NotificationData } from '../../components/Picker/NotificationSheet';
import { useCourseStore } from '../../stores/courseStore';
import { useAuthStore } from '../../stores/authStore';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import SearchBar from '../../components/InputFields/SearchBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Skeleton from '../../components/Container/Skeleton';
import { fetchActiveHomepageNotification } from '../../api/student/notification';

// HomePage Skeleton Component
const HomePageSkeleton: React.FC = () => {
  return (
    <View className="px-6 pt-6 flex-1 bg-[#FAFAFA]">
      {/* SearchBar Skeleton */}
      <Skeleton width="100%" height={50} borderRadius={25} style={{ marginBottom: 20 }} />

      {/* TopicsSection Skeleton - Horizontal list */}
      <View className="mb-6">
        <Skeleton width={120} height={20} borderRadius={4} style={{ marginBottom: 12 }} />
        <View className="flex-row space-x-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={80} height={80} borderRadius={12} />
          ))}
        </View>
      </View>

      {/* NoteswiftProCard Skeleton */}
      <Skeleton width="100%" height={120} borderRadius={12} style={{ marginBottom: 20 }} />

      {/* FeaturedClasses Skeleton */}
      <View className="mb-6">
        <Skeleton width={150} height={24} borderRadius={4} style={{ marginBottom: 12 }} />
        <View className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={100} borderRadius={12} />
          ))}
        </View>
      </View>

      {/* Quick Access Title Skeleton */}
      <Skeleton width={120} height={28} borderRadius={4} style={{ marginBottom: 12 }} />

      {/* QuickAccess Skeleton - Grid */}
      <View className="mb-6">
        <View className="flex-row flex-wrap justify-between">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} width="48%" height={80} borderRadius={12} style={{ marginBottom: 12 }} />
          ))}
        </View>
      </View>

      {/* RecommendationClasses Skeleton */}
      <View className="mb-6">
        <Skeleton width={180} height={24} borderRadius={4} style={{ marginBottom: 12 }} />
        <View className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={100} borderRadius={12} />
          ))}
        </View>
      </View>

      {/* FreeCourses Skeleton */}
      <View className="mb-6">
        <Skeleton width={120} height={24} borderRadius={4} style={{ marginBottom: 12 }} />
        <View className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={100} borderRadius={12} />
          ))}
        </View>
      </View>

      {/* UpcomingCourses Skeleton */}
      <View className="mb-6">
        <Skeleton width={140} height={24} borderRadius={4} style={{ marginBottom: 12 }} />
        <View className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={100} borderRadius={12} />
          ))}
        </View>
      </View>
    </View>
  );
};

function HomePage() {
  // Network status monitoring
  const isOnline = useNetworkStatus();

  const [notificationVisible, setNotificationVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [activeNotification, setActiveNotification] = useState<NotificationData | null>(null);

  const { user, isLoggedIn } = useAuthStore();
  const { 
    fetchFeaturedCourse, 
    fetchUserEnrollments,
    fetchAllCourses,
  } = useCourseStore();

  // Check if permissions have been requested before
  useEffect(() => {
    const checkPermissionsRequested = async () => {
      try {
        const permissionsRequested = await AsyncStorage.getItem('permissions_requested');
        if (!permissionsRequested && isLoggedIn && user) {
          // Request permissions directly without custom modal
          requestPermissions();
        }
      } catch (error) {
        console.error('Error checking permissions state:', error);
      }
    };

    if (isLoggedIn && user && isInitialized) {
      checkPermissionsRequested();
    }
  }, [isLoggedIn, user, isInitialized]);

  // Function to request permissions directly
  const requestPermissions = async () => {
    try {
      // Request permissions sequentially - native dialogs will appear
      const ImagePicker = await import('expo-image-picker');
      const MediaLibrary = await import('expo-media-library');
      const { Audio } = await import('expo-av');

      await ImagePicker.requestCameraPermissionsAsync();
      await Audio.requestPermissionsAsync();
      await MediaLibrary.requestPermissionsAsync();

      // Mark permissions as requested
      await AsyncStorage.setItem('permissions_requested', 'true');
    } catch (error) {
      console.error('Error requesting permissions:', error);
      // Still mark as requested even if there's an error
      await AsyncStorage.setItem('permissions_requested', 'true');
    }
  };

  // Initialize homepage data and check popup visibility
  const initializeHomePage = useCallback(async () => {
    if (!user || isInitialized) return;

    try {
      const userId = user?.id || (user as any)?._id;
      if (!userId) {
        throw new Error('User ID is missing');
      }
      
      console.log('Initializing HomePage for user:', userId);
      
      // Reset notification state before initializing
      setNotificationVisible(false);
      
      // Fetch both featured course and user enrollments
      await Promise.all([
        fetchFeaturedCourse(),
        fetchUserEnrollments(userId),
        fetchAllCourses()
      ]);

      // Fetch active notification separately
      const activeNotification = await fetchActiveHomepageNotification();
      console.log('Active notification fetched:', activeNotification);

      // Set the active notification if one exists and hasn't been dismissed
      if (activeNotification) {
        // Check if user has previously dismissed this notification
        const dismissedKey = `notification_dismissed_${activeNotification.id}`;
        const hasBeenDismissed = await AsyncStorage.getItem(dismissedKey);
        
        if (hasBeenDismissed === 'true') {
          console.log('Notification has been dismissed, not showing:', activeNotification.id);
        } else {
          console.log('Setting active notification:', activeNotification);
          setActiveNotification(activeNotification);
          // Show notification popup after a short delay for better UX
          setTimeout(() => {
            console.log('Setting notification visible to true for active notification');
            setNotificationVisible(true);
          }, 1500);
        }
      } else {
        console.log('No active notification found');
      }

      setIsInitialized(true);
      setIsLoading(false); // Hide loading state when initialization completes
    } catch (error) {
      console.error('Error initializing HomePage:', error);
      setIsInitialized(true); // Mark as initialized even on error to prevent retry loops
      setIsLoading(false); // Hide loading state even on error
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
  }, [user, isInitialized, fetchFeaturedCourse, fetchUserEnrollments, fetchAllCourses]);

  // Initialize data when screen focuses or user logs in
  useFocusEffect(
    React.useCallback(() => {
      // Show loading immediately for instant navigation
      setIsLoading(true);

      if (isLoggedIn && user) {
        // Start initialization but don't wait for it
        initializeHomePage();

        // Set loading to false immediately for ultra-fast skeleton
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }, [isLoggedIn, user, initializeHomePage])
  );

  // Handle course enrollment (legacy support)

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
        {isLoading ? (
          <HomePageSkeleton />
        ) : (
          <View className="px-6 pt-6 flex-1 bg-[#FAFAFA]">
            <SearchBar />

            <TopicsSection />
            <NoteswiftProCard />
            <FeaturedClasses />
            <Text className="text-2xl font-bold mb-3 text-gray-900">Quick Access</Text>
            <QuickAccess />
            <RecommendationClasses />
            <FreeCourses />
            <UpcomingCourses />
          </View>
        )}
      </ScrollView>

      <PrimaryNav current="Home" />

      {/* Notification Sheet */}
      <NotificationSheet
        visible={notificationVisible}
        onClose={handleClosePopup}
        notificationData={activeNotification || {
          id: 'homepage-notification',
          badge: 'Important',
          badgeIcon: 'notifications',
          title: 'Welcome to NoteSwift!',
          description: 'Explore our latest courses and start your learning journey today.',
          thumbnail: 'https://example.com/notification-image.jpg',
          showDontShowAgain: true,
          buttonText: 'Close',
          buttonIcon: 'close'
        }}
      />
    </KeyboardAvoidingView>
  );
}

HomePage.displayName = 'HomePage';
export default HomePage;