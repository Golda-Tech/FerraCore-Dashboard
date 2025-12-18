"use client";

import {
  IconCash,
  IconCirclePlusFilled,
  IconFileUpload,
  IconMoneybagMove,
  type Icon,
  IconChevronRight,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

import type { PageName } from "@/types/navigation";

/* --------------------------------------------------
   Updated to accept readonly arrays
-------------------------------------------------- */
type NavItem =
  | { readonly title: string; readonly page: PageName; readonly icon?: Icon }
  | {
      readonly title: string;
      readonly icon?: Icon;
      readonly isGroup: true;
      readonly pages: readonly { readonly title: string; readonly page: PageName; readonly icon?: Icon }[];
    };

export function NavMain({
  items,
  onNavigate,
  currentPath,
}: {
  items: readonly NavItem[];
  onNavigate: (page: PageName) => void;
  currentPath: string;
}) {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    "Rexhub Payments": true,
    Rexpay: true,
  });

  const toggleFolder = (name: string) =>
    setOpenFolders((o) => ({ ...o, [name]: !o[name] }));

  const isActive = (page: PageName) => currentPath === `/${page}`;

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Request Payment"
              className="cursor-pointer bg-primary text-primary-foreground
                                    hover:bg-primary/90 hover:text-primary-foreground
                                    active:bg-primary/90 active:text-primary-foreground
                                    min-w-8 duration-200 ease-linear"
              onClick={() => onNavigate("request-payment")}
            >
              <IconCash />
              <span>Request Payment</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {items.map((item) =>
            "isGroup" in item ? (
              <Collapsible
                key={item.title}
                open={openFolders[item.title]}
                onOpenChange={() => toggleFolder(item.title)}
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuItem>
                    <SidebarMenuButton className = "cursor-pointer" tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <IconChevronRight
                        className={`ml-auto h-4 w-4 transition-transform ${
                          openFolders[item.title] ? "rotate-90" : ""
                        }`}
                      />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.pages.map((sub) => (
                      <SidebarMenuSubItem key={sub.page}>
                        <SidebarMenuSubButton
                          asChild
                          className = "cursor-pointer"
                          data-active={isActive(sub.page)}
                          onClick={() => onNavigate(sub.page)}
                        >
                          <button
                          className="
                            w-full min-w-[14rem]                    /* at least 224 px           */
                            max-w-none                              /* no upper clamp            */
                            text-left inline-flex items-center
                            data-[active=true]:bg-gray-200 data-[active=true]:text-gray-900
                            dark:data-[active=true]:bg-gray-700 dark:data-[active=true]:text-gray-100
                            px-3 py-2 rounded-md
                          "
                          >
                            {sub.icon && <sub.icon className="mr-2 h-4 w-4" />}
                            <span>{sub.title}</span>
                          </button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                className = "cursor-pointer"
                  asChild
                  tooltip={item.title}
                  data-active={isActive(item.page)}
                >
                  <button
                    onClick={() => onNavigate(item.page)}
                    className="
                      cursor-pointer
                      w-full min-w-[14rem]                    /* at least 224 px           */
                      max-w-none                              /* no upper clamp            */
                      text-left inline-flex items-center
                      data-[active=true]:bg-gray-200 data-[active=true]:text-gray-900
                      dark:data-[active=true]:bg-gray-700 dark:data-[active=true]:text-gray-100
                      px-3 py-2 rounded-md
                    "
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}