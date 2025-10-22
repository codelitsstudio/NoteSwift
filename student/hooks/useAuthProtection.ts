import { useEffect } from 'react';
import { router, useSegments } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

export function useAuthProtection() {
  const { isLoggedIn, user } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    const currentPath = segments.join('/');
    const isOnboardingRoute = segments[0] === 'onboarding';
    const isMainApp = ['Home', 'Learn', 'Test', 'Ask', 'More', 'Notification', 'Screens'].includes(segments[0]);

    // If user is logged in and trying to access onboarding routes
    if (isLoggedIn && user && isOnboardingRoute) {
      // Force redirect to main app and replace the entire navigation stack
      router.replace('/Home/HomePage');
      return;
    }

    // If user is not logged in and trying to access protected routes
    if (!isLoggedIn && isMainApp) {
      // Force redirect to login and replace the entire navigation stack
      router.replace('/onboarding/Login/login');
      return;
    }

    // If user is not logged in and not on any specific route, redirect to login
    if (!isLoggedIn && currentPath === '') {
      router.replace('/onboarding/Login/login');
      return;
    }

    // If user is logged in and on root or empty route, redirect to home
    if (isLoggedIn && user && (currentPath === '' || currentPath === 'index')) {
      router.replace('/Home/HomePage');
      return;
    }
  }, [isLoggedIn, user, segments]);

  return { isLoggedIn, user };
}

// Hook to prevent back navigation to onboarding screens
export function usePreventOnboardingBackNavigation() {
  const { isLoggedIn, user } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const handleBeforeRemove = (e: any) => {
      const segments = e.target?.split('/') || [];
      const isNavigatingToOnboarding = segments.includes('onboarding');

      if (isNavigatingToOnboarding) {
        // Prevent the navigation
        e.preventDefault();
        // Force redirect to home
        router.replace('/Home/HomePage');
      }
    };

    // This is a conceptual implementation - the actual prevention happens in the layout
    return () => {
      // Cleanup if needed
    };
  }, [isLoggedIn, user]);
}
