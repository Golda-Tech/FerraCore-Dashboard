"use client";

import type * as React from "react";
import { useRouter, usePathname } from "next/navigation"; // Use next/navigation for App Router
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
  IconSettings,
  IconUsers,
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
import { getUser, logout } from "@/lib/auth"; // Import logout from lib/auth
import type { PageName } from "@/types/navigation";
import { useEffect, useState } from "react";
import { LoginResponse } from "@/types/auth";
import { UserCog } from "lucide-react";

const data = {
  user: {
    name: "John Merchant",
    email: "john@firstbank.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  navMain: [
    {
      title: "Dashboard",
      page: "dashboard" as PageName,
      icon: IconDashboard,
    },
    // {
    //   title: "Single Payout",
    //   page: "single-payment" as PageName,
    //   icon: IconCreditCard,
    // },
    // {
    //   title: "Bulk Upload Payout",
    //   page: "bulk-upload" as PageName,
    //   icon: IconFileUpload,
    // },
    // {
    //   title: "Approvals",
    //   page: "approvals" as PageName,
    //   icon: IconUsers,
    // },
    // {
    //   title: "Analytics",
    //   page: "analytics" as PageName,
    //   icon: IconChartBar,
    // },
    {
      title: "Collections",
      page: "collections" as PageName,
      icon: IconMoneybag,
    },
    // {
    //   title: "Transactions",
    //   page: "transactions" as PageName,
    //   icon: IconHistory,
    // },
    // {
    //   title: "Fund Account",
    //   page: "fund-account" as PageName,
    //   icon: IconBuildingBank,
    // },

    {
      title: "User Management",
      page: "user-management" as PageName,
      icon: IconUsers,
    }
  ],
  navSecondary: [
    {
      title: "Settings",
      page: "settings" as PageName,
      icon: IconSettings,
    },
    {
      title: "Get Help",
      page: "help" as PageName,
      icon: IconHelp,
    },
  ],
  documents: [
    // {
    //   name: "Reports",
    //   page: "reports" as PageName,
    //   icon: IconReport,
    // },
    // {
    //   name: "Archives",
    //   page: "archives" as PageName,
    //   icon: IconHistory,
    // },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname(); // Use usePathname for current path

  const [user, setUser] = useState<LoginResponse | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleNavigation = (page: PageName) => {
    router.push(`/${page}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <button onClick={() => handleNavigation("dashboard")}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  Collections Gateway
                </span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={data.navMain}
          onNavigate={handleNavigation}
          currentPath={pathname}
        />
        {/* <NavDocuments
          items={data.documents}
          onNavigate={handleNavigation}
          currentPath={pathname}
        /> */}
        <NavSecondary
          items={data.navSecondary}
          onNavigate={handleNavigation}
          currentPath={pathname}
          className="mt-auto"
        />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} onLogout={handleLogout} />
      </SidebarFooter> */}

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
