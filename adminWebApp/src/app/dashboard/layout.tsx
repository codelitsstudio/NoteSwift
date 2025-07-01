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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
    const { toast } = useToast();

  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      router.push("/login");
    } else {
      setIsAuthenticating(false);
    }
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 500));

    localStorage.removeItem("isAuthenticated");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/login");
  };

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
                           <img
      src="/assets/logo.jpg"
      alt="NoteSwift Logo"
      className="h-14 w-14 object-contain animate-pulse"
    />          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
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
                <AvatarImage src="https://placehold.co/40x40.png" alt="Admin" />
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
        <div className="flex flex-col flex-1 min-h-screen bg-background">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b z-10 bg-background">
            <SidebarTrigger />
            <h2 className="text-xl font-semibold font-headline">
              Welcome Back!
            </h2>
       <Button onClick={handleLogout} disabled={isLoggingOut}>
                 {isLoggingOut && <Loader2 className="animate-spin" />}
                 Logout
               </Button>
          </header>

          {/* Main content */}
          <main className="flex-1 w-full p-4 md:p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
