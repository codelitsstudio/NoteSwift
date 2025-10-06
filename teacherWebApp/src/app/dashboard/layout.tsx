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
import { DashboardGreetingSimple } from "@/components/dashboard-greeting-simple";

import { LoadingProvider } from "@/context/loading-context";
import { LoadingBar } from "@/components/ui/loading-bar";
import { PageNavigationHandler } from "@/components/page-navigation-handler";
import { TeacherProvider } from "@/context/teacher-context";

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

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      router.push("/login");
    } else {
      setIsAuthenticating(false);
    }
  }, [hasMounted, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    localStorage.removeItem("isAuthenticated");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/login");
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
    <TeacherProvider>
      <LoadingProvider>
        <PageNavigationHandler />
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            {/* Sidebar */}
            <Sidebar className="h-full bg-sidebar/80 backdrop-blur supports-[backdrop-filter]:bg-sidebar/70">
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
                  <span className="font-semibold text-sm">NoteSwift Teacher</span>
                  <span className="text-xs text-muted-foreground">
                    teacher@noteswift.com
                  </span>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          {/* Right side */}
          <SidebarInset>
            <div className="flex flex-col flex-1 min-h-screen bg-background/60">
              {/* Header */}
              <header className="sticky top-0 flex items-center justify-between p-4 md:p-5 border-b z-20 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <SidebarTrigger />
                <h2 className="text-xl md:text-2xl font-semibold font-headline">
                  <DashboardGreetingSimple />
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
    </TeacherProvider>
  );
}
