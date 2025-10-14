"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Users,
  Bell,
  CreditCard,
  Settings,
  ShieldCheck,
  Info,
  UserCheck,
  BookOpen,
  Sparkles,
  BotMessageSquare,
  Receipt,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLoading } from "@/context/loading-context";
import { useAdmin } from "@/context/admin-context";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/admin-management", label: "Admin Management", icon: ShieldCheck },
  { href: "/dashboard/teacher-management", label: "Teacher Management", icon: Users },
  { href: "/dashboard/courses", label: "Courses", icon: BookOpen },
  { href: "/dashboard/recommendations", label: "Course Recommendations", icon: BotMessageSquare },

  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/reports", label: "Reports", icon: LineChart },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/revenue", label: "Revenue", icon: CreditCard },
  { href: "/dashboard/orders-payments", label: "Orders & Payments", icon: Receipt },
  { href: "/dashboard/audit-log", label: "Audit Log", icon: ShieldCheck },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/about", label: "About", icon: Info },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { startLoading } = useLoading();
  const { admin } = useAdmin();

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "system_admin":
        return { text: "System Admin", variant: "destructive" as const, className: "" };
      case "super_admin":
        return { text: "Super Admin", variant: "default" as const, className: "bg-purple-500 text-white" };
      case "admin":
        return { text: "Admin", variant: "secondary" as const, className: "bg-blue-500 text-white" };
      default:
        return { text: "Admin", variant: "secondary" as const, className: "bg-blue-500 text-white" };
    }
  };

  const roleDisplay = admin ? getRoleDisplay(admin.role) : { text: "Loading...", variant: "secondary" as const, className: "" };

  return (
    <nav className="flex flex-col h-full">
      <div className="px-4 py-4">
        {admin?.role && (
          <div className="mb-2">
            <Badge variant={roleDisplay.variant} className={cn("text-xs", roleDisplay.className)}>
              {roleDisplay.text}
            </Badge>
          </div>
        )}
        <h2 className="text-lg font-bold">Admin Panel</h2>
      </div>
      <SidebarMenu className="flex-1 overflow-y-auto px-2 space-y-1">
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
  pathname === link.href
    ? "bg-primary text-primary-foreground"
    : "hover:bg-blue-100 text-gray-700 hover:text-blue-600"
)}

              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
