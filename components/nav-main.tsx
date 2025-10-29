"use client";

import {
  IconCash,
  IconCirclePlusFilled,
  IconFileUpload,
  IconMoneybagMove,
  type Icon,
  IconChevronRight, // for folder caret
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
   Shape we expect now:
   - flat :  { title, page, icon }
   - group:  { title, icon, isGroup:true, pages:[{title,page,icon}] }
-------------------------------------------------- */
type NavItem =
  | { title: string; page: PageName; icon?: Icon } // flat
  | {
      title: string;
      icon?: Icon;
      isGroup: true;
      pages: { title: string; page: PageName; icon?: Icon }[];
    };

export function NavMain({
  items,
  onNavigate,
  currentPath,
}: {
  items: NavItem[];
  onNavigate: (page: PageName) => void;
  currentPath: string; // /dashboard, /payments, ...
}) {
  /* open-state for collapsible folders – default open */
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    Ferracore: true,
    Rexpay: true,
  });

  const toggleFolder = (name: string) =>
    setOpenFolders((o) => ({ ...o, [name]: !o[name] }));

  /* helper: is a nested page active? */
  const isActive = (page: PageName) => currentPath === `/${page}`;

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {/* -------- BIG orange CTA (kept as-is) -------- */}
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Request Payment"
              className="bg-primary text-primary-foreground
                                    hover:bg-primary/90 hover:text-primary-foreground
                                    active:bg-primary/90 active:text-primary-foreground
                                    min-w-8 duration-200 ease-linear"
              onClick={() => onNavigate("request-payment")}
            >
              <IconCash />
              <span>Request Payment</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* -------- NAV TREE -------- */}
          {items.map((item) =>
            /* ----------  GROUP  ---------- */
            "isGroup" in item ? (
              <Collapsible
                key={item.title}
                open={openFolders[item.title]}
                onOpenChange={() => toggleFolder(item.title)}
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip={item.title}>
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
                          data-active={isActive(sub.page)}
                          onClick={() => onNavigate(sub.page)}
                        >
                          <button
                            className="data-[active=true]:bg-gray-200 data-[active=true]:text-gray-900
                                       dark:data-[active=true]:bg-gray-700 dark:data-[active=true]:text-gray-100"
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
              /* ----------  FLAT ITEM  ---------- */
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  data-active={isActive(item.page)}
                >
                  <button
                    onClick={() => onNavigate(item.page)}
                    className="data-[active=true]:bg-gray-200 data-[active=true]:text-gray-900
                               dark:data-[active=true]:bg-gray-700 dark:data-[active=true]:text-gray-100"
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