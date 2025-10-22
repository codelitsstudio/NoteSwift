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
import { TeacherProvider, useTeacher } from "@/context/teacher-context";
import { DashboardGuard } from "@/components/auth-guard";
import { useTeacherAuth } from "@/context/teacher-auth-context";

function SidebarFooterContent() {
  const { teacherName, teacherEmail, teacherProfilePic } = useTeacher();

  return (
    <SidebarFooter>
      <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={teacherProfilePic || "https://placehold.co/40x40.png"}
            alt="Teacher"
            className="object-cover"
          />
          <AvatarFallback className="bg-primary text-primary-foreground">T</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{teacherName}</span>
          <span className="text-xs text-muted-foreground">
            {teacherEmail}
          </span>
        </div>
      </div>
    </SidebarFooter>
  );
}

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { logout } = useTeacherAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    logout();

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/login");
  };

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

              <SidebarFooterContent />
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </DashboardGuard>
  );
}
