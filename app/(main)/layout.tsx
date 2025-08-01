"use client"; // This layout needs to be a client component to use localStorage for auth check

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { isAuthenticated } from "@/lib/auth"; // Import isAuthenticated
import { redirect } from "next/navigation"; // Import redirect

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Client-side authentication check for protected routes
  React.useEffect(() => {
    if (!isAuthenticated()) {
      redirect("/login");
    }
  }, []);

  // The defaultOpen prop for SidebarProvider should ideally come from a server-side cookie
  // For now, we'll hardcode it or derive it client-side if needed.
  const defaultOpen = true; // Or read from client-side cookie if implemented

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
