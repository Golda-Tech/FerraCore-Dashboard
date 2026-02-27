"use client"; // This layout needs to be a client component to use localStorage for auth check

import * as React from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { isAuthenticated } from "@/lib/auth";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = React.useState(false);
  const [isAuthed, setIsAuthed] = React.useState(false);

  // Client-side authentication check for protected routes
  React.useEffect(() => {
    const authed = isAuthenticated();
    if (!authed) {
      router.replace("/login");
    } else {
      setIsAuthed(true);
    }
    setAuthChecked(true);
  }, [router]);

  // Don't render anything until auth check is complete
  if (!authChecked || !isAuthed) {
    return null;
  }

  const defaultOpen = true;

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
