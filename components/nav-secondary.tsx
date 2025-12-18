"use client";

import type * as React from "react";
import type { Icon } from "@tabler/icons-react";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import type { PageName } from "@/types/navigation";

export function NavSecondary({
  items,
  onNavigate,
  currentPath, // Pass currentPath as a prop
  ...props
}: {
  items: {
    title: string;
    page: PageName;
    icon: Icon;
  }[];
  onNavigate: (page: PageName) => void;
  currentPath: string; // Define prop type
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const router = useRouter();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton className = "cursor-pointer" asChild>
                <button
                  onClick={() => onNavigate(item.page)}
                  className={
                    currentPath === `/${item.page}` ? "data-[active=true]" : ""
                  } // Use currentPath
                >
                  <item.icon />
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
