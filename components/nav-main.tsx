"use client";

import {
  IconCirclePlusFilled,
  IconFileUpload,
  type Icon,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type PageName =
  | "dashboard"
  | "single-payment"
  | "bulk-upload"
  | "approvals"
  | "analytics"
  | "transactions"
  | "fund-account"
  | "settings"
  | "help"
  | "reports"
  | "templates"
  | "merchants";

export function NavMain({
  items,
  onNavigate,
  currentPath, // Pass currentPath as a prop
}: {
  items: {
    title: string;
    page: PageName;
    icon?: Icon;
  }[];
  onNavigate: (page: PageName) => void;
  currentPath: string; // Define prop type
}) {
  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              asChild
              tooltip="New Payout"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <button onClick={() => onNavigate("single-payment")}>
                <IconCirclePlusFilled />
                <span>New Payout</span>
              </button>
            </SidebarMenuButton>
            <Button
              asChild
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0 bg-transparent"
              variant="outline"
            >
              <button onClick={() => onNavigate("bulk-upload")}>
                <IconFileUpload />
                <span className="sr-only">Bulk Upload</span>
              </button>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <button
                  onClick={() => onNavigate(item.page)}
                  className={
                    currentPath === `/${item.page}` ? "data-[active=true]" : ""
                  } // Use currentPath
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
