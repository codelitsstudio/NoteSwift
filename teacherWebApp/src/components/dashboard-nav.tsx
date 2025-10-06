"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookCopy,
  LayoutDashboard,
  LineChart,
  Users,
  Bell,
  CreditCard,
  Settings,
  ShieldCheck,
  Info,
  Crown,
  Video,
  VideoIcon
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useLoading } from "@/context/loading-context";
import { TeacherAssignments } from "@/components/teacher-assignments";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/dashboard/courses",
    label: "My Courses",
    icon: BookCopy,
    children: [
      { href: "/dashboard/courses/new-chapter", label: "Create Chapter/Topic" },
      { href: "/dashboard/courses/upload-content", label: "Upload Content" },
    ]
  },
  { href: "/dashboard/live-classes", label: "Live Classes", icon: VideoIcon },
  { href: "/dashboard/students", label: "My Students", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: LineChart },
  {
    href: "/dashboard/assignments",
    label: "Assignments",
    icon: Bell,
    children: [
      { href: "/dashboard/assignments/new", label: "Create Assignment" },
      { href: "/dashboard/assignments/plagiarism", label: "Plagiarism Checker" },
    ]
  },
  {
    href: "/dashboard/tests",
    label: "Tests",
    icon: LineChart,
    children: [
      { href: "/dashboard/tests/new", label: "Create New Test" },
      { href: "/dashboard/tests/add-questions", label: "Add Questions" },
    ]
  },
  { href: "/dashboard/doubts", label: "Doubts", icon: Info },
  { href: "/dashboard/resources", label: "Resources", icon: BookCopy },
  {
    href: "/dashboard/announcements",
    label: "Announcements",
    icon: Bell,
    children: [
      { href: "/dashboard/announcements/new", label: "Create Announcement" },
    ]
  },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { startLoading } = useLoading();

  return (
    <nav className="flex flex-col h-full">
      <div className="px-4 py-4 pb-3">
        <h2 className="text-lg font-bold">Teacher Panel</h2>
      </div>
      <TeacherAssignments />
      <SidebarMenu className="flex-1 overflow-y-auto px-2 space-y-1 pt-4">
        {links.map((link) => (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton asChild>
              <Link
                href={link.href}
                onClick={() => {
                  if (link.href !== pathname) {
                    startLoading();
                  }
                }}
               className={cn(
  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
  ((link as any).children && pathname.startsWith(`${link.href}/`)) || pathname === link.href
    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
    : "text-foreground/80 hover:bg-secondary hover:text-foreground"
)}

              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            </SidebarMenuButton>
            {link.children && (
              <SidebarMenuSub>
                {link.children.map((child) => (
                  <SidebarMenuSubItem key={child.href}>
                    <SidebarMenuSubButton asChild isActive={pathname === child.href}>
                      <Link href={child.href}>{child.label}</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
