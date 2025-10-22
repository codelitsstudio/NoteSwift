"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTeacherAuth } from '@/context/teacher-auth-context';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
  requireApproval?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * AuthGuard component for protecting routes based on authentication and onboarding status
 *
 * @param requireAuth - Whether authentication is required (default: true)
 * @param requireOnboarding - Whether completed onboarding is required
 * @param requireApproval - Whether admin approval is required
 * @param redirectTo - Where to redirect if conditions aren't met
 * @param fallback - Custom fallback component to show while loading/checking
 */
export function AuthGuard({
  children,
  requireAuth = true,
  requireOnboarding = false,
  requireApproval = false,
  redirectTo,
  fallback
}: AuthGuardProps) {
  const { isAuthenticated, needsOnboarding, isApproved, loading } = useTeacherAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Still checking auth status

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo || '/login');
      return;
    }

    // Check onboarding requirement
    if (requireOnboarding && needsOnboarding) {
      router.push(redirectTo || '/onboarding');
      return;
    }

    // Check approval requirement
    if (requireApproval && !isApproved) {
      router.push(redirectTo || '/pending-approval');
      return;
    }

    // If authenticated but needs onboarding, redirect to onboarding
    if (isAuthenticated && !requireOnboarding && needsOnboarding && window.location.pathname !== '/onboarding') {
      router.push('/onboarding');
      return;
    }

    // If authenticated and onboarding complete but not approved, redirect to pending approval
    if (isAuthenticated && !needsOnboarding && !isApproved && window.location.pathname !== '/pending-approval') {
      router.push('/pending-approval');
      return;
    }

  }, [isAuthenticated, needsOnboarding, isApproved, loading, requireAuth, requireOnboarding, requireApproval, redirectTo, router]);

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/logo.jpg"
            alt="NoteSwift Logo"
            className="h-14 w-14 object-contain animate-pulse"
          />
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Check conditions for rendering children
  const shouldRender = (
    (!requireAuth || isAuthenticated) &&
    (!requireOnboarding || !needsOnboarding) &&
    (!requireApproval || isApproved)
  );

  if (!shouldRender) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * LoginGuard - Redirects authenticated users to appropriate pages based on their status
 */
export function LoginGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, needsOnboarding, isApproved, loading } = useTeacherAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      if (needsOnboarding) {
        router.replace('/onboarding');
      } else if (!isApproved) {
        router.replace('/pending-approval');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, needsOnboarding, isApproved, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/logo.jpg"
            alt="NoteSwift Logo"
            className="h-14 w-14 object-contain animate-pulse"
          />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Only show login page if not authenticated
  return <>{!isAuthenticated ? children : null}</>;
}

/**
 * DashboardGuard - Requires authentication, completed onboarding, and approval
 */
export function DashboardGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard
      requireAuth={true}
      requireOnboarding={true}
      requireApproval={true}
      redirectTo="/login"
    >
      {children}
    </AuthGuard>
  );
}

/**
 * OnboardingGuard - Requires authentication but redirects if onboarding is complete
 */
export function OnboardingGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, needsOnboarding, isApproved, loading } = useTeacherAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // If onboarding is complete, redirect based on approval status
    if (!needsOnboarding) {
      if (isApproved) {
        router.replace('/dashboard');
      } else {
        router.replace('/pending-approval');
      }
      return;
    }
  }, [isAuthenticated, needsOnboarding, isApproved, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/logo.jpg"
            alt="NoteSwift Logo"
            className="h-14 w-14 object-contain animate-pulse"
          />
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Only show onboarding if authenticated and needs onboarding
  return <>{isAuthenticated && needsOnboarding ? children : null}</>;
}

/**
 * ApprovalGuard - Requires authentication and completed onboarding, redirects approved users to dashboard
 */
export function ApprovalGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, needsOnboarding, isApproved, loading } = useTeacherAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (needsOnboarding) {
      router.replace('/onboarding');
      return;
    }

    // If approved, redirect to dashboard
    if (isApproved) {
      router.replace('/dashboard');
      return;
    }
  }, [isAuthenticated, needsOnboarding, isApproved, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/logo.jpg"
            alt="NoteSwift Logo"
            className="h-14 w-14 object-contain animate-pulse"
          />
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Only show pending approval if authenticated, onboarding complete, but not approved
  return <>{isAuthenticated && !needsOnboarding && !isApproved ? children : null}</>;
}