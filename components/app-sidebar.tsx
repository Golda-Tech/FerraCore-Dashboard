"use client";

import * as React from "react";
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
  IconFolder,
} from "@tabler/icons-react";
import { UserPlus } from "lucide-react";

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

/* ----------  NAVIGATION CONFIGURATION  ---------- */

// Match NavMain's Icon type exactly - size can be string or number
type Icon = React.ForwardRefExoticComponent<{
  className?: string;
  size?: string | number;
  stroke?: string;
} & React.RefAttributes<SVGSVGElement>>;

// Or use FunctionComponent if that's what NavMain expects
// type Icon = React.FunctionComponent<{
//   className?: string;
//   size?: string | number;
//   stroke?: string;
// }>;

// Define all possible pages in the "Rexhub Partners & Users" group
type PartnersUsersPage = {
  title: string;
  page: PageName;
  icon: Icon;
  allowedRoles: string[];
};

const partnersUsersPages: PartnersUsersPage[] = [
  {
    title: "Register Partners",
    page: "admin-register" as PageName,
    icon: UserPlus as unknown as Icon,
    allowedRoles: ["SUPER_ADMIN", "GA_ADMIN"],
  },
  {
    title: "Register Users",
    page: "user-register" as PageName,
    icon: UserPlus as unknown as Icon,
    allowedRoles: ["SUPER_ADMIN", "GA_ADMIN", "BUSINESS_ADMIN"],
  },
  {
    title: "Manage Partners",
    page: "partner-management" as PageName,
    icon: IconUsers as unknown as Icon,
    allowedRoles: ["SUPER_ADMIN", "GA_ADMIN"],
  },
  {
    title: "Manage Users",
    page: "user-management" as PageName,
    icon: IconUserCircle as unknown as Icon,
    allowedRoles: ["SUPER_ADMIN", "GA_ADMIN", "BUSINESS_ADMIN"],
  },
];

// Filter pages based on user role
const getPartnersUsersPages = (userRole: string | undefined) => {
  if (!userRole) return [];

  if (userRole === "BUSINESS_FINANCE" || userRole === "BUSINESS_OPERATOR") {
    return [];
  }

  return partnersUsersPages.filter((page) =>
    page.allowedRoles.includes(userRole)
  );
};

// Navigation item types
type NavItemPage = {
  title: string;
  page: PageName;
  icon: Icon;
};

type NavItemGroup = {
  title: string;
  icon: Icon;
  isGroup: true;
  pages: NavItemPage[];
};

// Use type that matches NavMain's expected readonly structure
type NavItem = {
  readonly title: string;
  readonly icon?: Icon;
  readonly isGroup: true;
  readonly pages: readonly {
    readonly title: string;
    readonly page: PageName;
    readonly icon?: Icon;
  }[];
};

const navSecondary: NavItemPage[] = [
  { title: "Settings", page: "settings" as PageName, icon: IconSettings as unknown as Icon },
];

const documents: any[] = [];

/* ----------  COMPONENT  ---------- */
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<LoginResponse | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  // Build dynamic navigation based on user role
  const navMain: readonly NavItem[] = React.useMemo(() => {
    const userRole = user?.role;

    const baseNav: NavItem[] = [
      {
        title: "Rexhub Payments",
        icon: IconFolder as unknown as Icon,
        isGroup: true,
        pages: [
          { title: "Dashboard", page: "dashboard" as PageName, icon: IconDashboard as unknown as Icon },
          { title: "Payments Summary", page: "payments" as PageName, icon: IconPaywall as unknown as Icon },
        ],
      },
    ];

    const partnersUsersPagesFiltered = getPartnersUsersPages(userRole);

    if (partnersUsersPagesFiltered.length > 0) {
      baseNav.push({
        title: "Rexhub Partners & Users",
        icon: IconFolder as unknown as Icon,
        isGroup: true,
        pages: partnersUsersPagesFiltered.map((p) => ({
          title: p.title,
          page: p.page,
          icon: p.icon,
        })),
      });
    }

    return baseNav as readonly NavItem[];
  }, [user?.role]);

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