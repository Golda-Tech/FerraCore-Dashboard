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
  IconSettings,
  IconUsers,
  IconFolder,      // parent-folder icon (optional)
} from "@tabler/icons-react";

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
    title: "Ferracore",
    icon: IconFolder,
    isGroup: true,
    pages: [
      { title: "Dashboard (Payments)", page: "dashboard" as PageName, icon: IconDashboard },
      { title: "Payments Summary", page: "payments" as PageName, icon: IconPaywall },
    ],
  },
  {
    title: "Rexpay",
    icon: IconFolder,
    isGroup: true,
    pages: [
      { title: "Request Collection", page: "new-collection" as PageName, icon: IconCash },
      { title: "Collections Summary", page: "collections" as PageName, icon: IconMoneybag },
    ],
  },
  {
    title: "User Management",
    page: "user-management" as PageName,
    icon: IconUsers,
  },
] as const;

const navSecondary = [
  { title: "Settings", page: "settings" as PageName, icon: IconSettings },
  { title: "Get Help", page: "help" as PageName, icon: IconHelp },
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
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <button onClick={() => handleNavigation("dashboard")}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Payments Gateway</span>
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