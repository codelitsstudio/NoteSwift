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
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useLoading } from "@/context/loading-context";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/content", label: "Content", icon: BookCopy },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/reports", label: "Reports", icon: LineChart },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/subscription", label: "Subscription", icon: Crown },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/audit-log", label: "Audit Log", icon: ShieldCheck },
  { href: "/dashboard/about", label: "About", icon: Info },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { startLoading } = useLoading();

  return (
    <nav className="flex flex-col h-full">
      <div className="px-4 py-4">
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
