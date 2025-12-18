"use client";

import type * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  IconBuildingBank,
  IconChartBar,
  IconCreditCard,
  IconDashboard,
  IconFileUpload,
  IconHelp,
  IconHistory,
  IconInnerShadowTop,
  IconMoneybag,
  IconPaywall,
  IconReport,
  IconCash,
  IconUserCircle,
  IconSettings,
  IconUsers,
  IconFolder,      // parent-folder icon (optional)
} from "@tabler/icons-react";
import { UserPlus } from "lucide-react";

import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

export type Icon = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
>;

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getUser, logout } from "@/lib/auth";
import type { PageName } from "@/types/navigation";
import { useEffect, useState } from "react";
import { LoginResponse } from "@/types/auth";
import { UserCog } from "lucide-react";

/* ----------  NEW GROUPED NAV  ---------- */
const navMain = [
  {
    title: "Rexhub Payments",
    icon: IconFolder,
    isGroup: true,
    pages: [
      { title: "Dashboard", page: "dashboard" as PageName, icon: IconDashboard },
      { title: "Payments Summary", page: "payments" as PageName, icon: IconPaywall },
    ],
  },
  {
    title: "Rexhub Partners & Users",
    icon: IconFolder,
    isGroup: true,
    pages: [
      { title: "Register Partners", page: "admin-register" as PageName, icon:  UserPlus },
      { title: "Manage Partners", page: "partner-management" as PageName, icon: IconUsers },
      { title: "Manage Users", page: "user-management" as PageName, icon: IconUserCircle },
    ],
  },



] as const;

const navSecondary = [
  { title: "Settings", page: "settings" as PageName, icon: IconSettings },
];

const documents: any[] = []; // empty for now

/* ----------  COMPONENT  ---------- */
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<LoginResponse | null>(null);
  useEffect(() => setUser(getUser()), []);

  const handleNavigation = (page: PageName) => router.push(`/${page}`);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-2">
              <button
                onClick={() => handleNavigation("dashboard")}
                className="flex h-14 w-full items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <img
                  src="/rexpay-logo.png"
                  alt="Rexpay"
                  className="h-8 w-auto object-contain"
                />
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain
          items={navMain}
          onNavigate={handleNavigation}
          currentPath={pathname}
        />
        <NavSecondary
          items={navSecondary}
          onNavigate={handleNavigation}
          currentPath={pathname}
          className="mt-auto"
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: user ? `${user.firstname} ${user.lastname}` : "Guest User",
            email: user?.email ?? "guest@example.com",
            avatar: "/placeholder.svg?height=32&width=32",
          }}
          onLogout={handleLogout}
        />
      </SidebarFooter>
    </Sidebar>
  );
}