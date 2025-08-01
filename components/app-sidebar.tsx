"use client"

import type * as React from "react"
import { useRouter, usePathname } from "next/navigation" // Use next/navigation for App Router
import {
  IconBuildingBank,
  IconChartBar,
  IconCreditCard,
  IconDashboard,
  IconFileUpload,
  IconHelp,
  IconHistory,
  IconInnerShadowTop,
  IconReport,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { logout } from "@/lib/auth" // Import logout from lib/auth

type PageName =
  | "dashboard"
  | "single-payment"
  | "bulk-upload"
  | "approvals"
  | "analytics"
  | "transactions"
  | "settings"
  | "help"
  | "reports"
  | "templates"
  | "merchants"

const data = {
  user: {
    name: "John Merchant",
    email: "john@firstbank.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  navMain: [
    {
      title: "Dashboard",
      page: "dashboard",
      icon: IconDashboard,
    },
    {
      title: "Single Payment",
      page: "single-payment",
      icon: IconCreditCard,
    },
    {
      title: "Bulk Upload",
      page: "bulk-upload",
      icon: IconFileUpload,
    },
    {
      title: "Approvals",
      page: "approvals",
      icon: IconUsers,
    },
    {
      title: "Analytics",
      page: "analytics",
      icon: IconChartBar,
    },
    {
      title: "Transactions",
      page: "transactions",
      icon: IconHistory,
    },
    {
      title: "Merchants",
      page: "merchants",
      icon: IconBuildingBank,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      page: "settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      page: "help",
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: "Reports",
      page: "reports",
      icon: IconReport,
    },
    {
      name: "Templates",
      page: "templates",
      icon: IconFileUpload,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname() // Use usePathname for current path

  const handleNavigation = (page: PageName) => {
    router.push(`/${page}`)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <button onClick={() => handleNavigation("dashboard")}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Collections Gateway</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} onNavigate={handleNavigation} currentPath={pathname} />
        <NavDocuments items={data.documents} onNavigate={handleNavigation} currentPath={pathname} />
        <NavSecondary
          items={data.navSecondary}
          onNavigate={handleNavigation}
          currentPath={pathname}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} onLogout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  )
}
