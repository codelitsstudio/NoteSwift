// app/index.tsx
import React, { useEffect } from 'react';
import { Redirect, router } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isLoggedIn, user } = useAuthStore();
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    // Small delay to ensure auth state is properly loaded
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (isLoggedIn && user) {
      // User is authenticated, go to main app
      router.replace('/Home/HomePage');
    } else {
      // User is not authenticated, go to login
      router.replace('/onboarding/Login/login');
    }
  }, [isLoggedIn, user, isReady]);

  // Show loading while determining auth state
  if (!isReady) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Fallback redirects (should not be reached due to useEffect above)
  if (isLoggedIn && user) {
    return <Redirect href="/Home/HomePage" />;
  }

  return <Redirect href="/onboarding/Login/login" />;
}