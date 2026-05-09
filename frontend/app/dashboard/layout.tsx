"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumbs } from "@/components/shared/dynamic-breadcrumbs";
import { Separator } from "@/components/ui/separator";
import { NotificationBell } from "@/components/notifications/notification-bell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background/50">
          <header className="flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b border-border/40 px-6 bg-background isolate sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mx-3 data-[orientation=vertical]:h-4 bg-border/60"
              />
              <div className="pl-1">
                <DynamicBreadcrumbs />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
            </div>
          </header>
          <main className="p-8 flex-1">
            <div className="mx-auto max-w-7xl space-y-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
