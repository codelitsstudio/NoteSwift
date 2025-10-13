"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { DashboardNav } from "@/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

import { LoadingProvider } from "@/context/loading-context";
import { LoadingBar } from "@/components/ui/loading-bar";
import { PageNavigationHandler } from "@/components/page-navigation-handler";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [sessionExpiryWarning, setSessionExpiryWarning] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    // Check authentication using both cookie and localStorage validation
    const checkAuth = async () => {
      try {
        const { validateCurrentSession, getClientSessionInfo } = await import('@/lib/auth');

        const isSessionValid = await validateCurrentSession();
        const clientInfo = getClientSessionInfo();

        if (isSessionValid && clientInfo.isAuthenticated) {
          setIsAuthenticating(false);
          // Start session monitoring
          startSessionMonitoring();
        } else {
          // Clear any stale data
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('admin_session_backup');
          router.push('/login');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [hasMounted, router]);

  // Session monitoring and auto-refresh
  const startSessionMonitoring = () => {
    // Check session every 5 minutes
    const sessionCheckInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (!data.success) {
          // Session invalid, redirect to login
          clearInterval(sessionCheckInterval);
          handleLogout();
          return;
        }

        if (data.session.needsRefresh) {
          // Auto-refresh session
          const refreshResponse = await fetch('/api/auth/session', {
            method: 'POST',
          });

          if (!refreshResponse.ok) {
            console.warn('Session refresh failed');
            setSessionExpiryWarning(true);
          } else {
            setSessionExpiryWarning(false);
          }
        }
      } catch (error) {
        console.error('Session monitoring error:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup on unmount
    return () => clearInterval(sessionCheckInterval);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const { clearAdminSession } = await import('@/lib/auth');
      await clearAdminSession();

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });

      // Small delay for smooth transition
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/login");
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if clearing fails
      localStorage.clear();
      router.push('/login');
    }
  };

  // Don't render anything on first server load to avoid hydration mismatch
  if (!hasMounted) return null;

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/logo.jpg"
            alt="NoteSwift Logo"
            className="h-14 w-14 object-contain animate-pulse"
          />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <LoadingProvider>
      <PageNavigationHandler />

      {/* Session Expiry Warning */}
      {sessionExpiryWarning && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  Your session will expire soon. Please save your work.
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setSessionExpiryWarning(false)}
                  className="inline-flex text-yellow-400 hover:text-yellow-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          {/* Sidebar */}
          <Sidebar className="h-full">
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <img
                  src="/assets/logo2.png"
                  alt="NoteSwift Logo"
                  className="h-15 w-15 object-contain"
                />
              </div>
            </SidebarHeader>

            <SidebarContent>
              <DashboardNav />
            </SidebarContent>

            <SidebarFooter>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                <Avatar>
                  <AvatarImage
                    src="https://placehold.co/40x40.png"
                    alt="Admin"
                  />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">NoteSwift Admin</span>
                  <span className="text-xs text-muted-foreground">
                    admin@noteswift.com
                  </span>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          {/* Right side */}
          <SidebarInset>
            <div className="flex flex-col flex-1 min-h-screen bg-background">
              {/* Header */}
              <header className="flex items-center justify-between p-4 border-b z-10 bg-background relative">
                <SidebarTrigger />
                <h2 className="text-xl font-semibold font-headline">
                  Welcome Back!
                </h2>
                <Button onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut && <Loader2 className="animate-spin mr-2" />}
                  Logout
                </Button>
                <LoadingBar />
              </header>

              {/* Main content */}
              <main className="flex-1 w-full p-4 md:p-6 lg:p-8 overflow-auto">
                {children}
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </LoadingProvider>
  );
}
