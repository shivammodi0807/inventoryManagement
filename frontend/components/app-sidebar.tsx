"use client"

import * as React from "react"
import Link from "next/link"

import { NavMain, type NavItem } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  GalleryVerticalEndIcon,
  LayoutDashboardIcon,
  PackageIcon,
  TruckIcon,
  ClipboardListIcon,
  BellIcon,
  Settings2Icon,
} from "lucide-react"

const platformNav: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
    // Always visible to anyone authenticated. No perms requirement.
  },
  {
    title: "Inventory",
    url: "/dashboard/inventory",
    icon: <PackageIcon />,
    perms: [
      ["view", "product"],
      ["view", "category"],
      ["view", "unit"],
    ],
    items: [
      {
        title: "Products",
        url: "/dashboard/inventory/products",
        perm: ["view", "product"],
      },
      {
        title: "Categories",
        url: "/dashboard/inventory/categories",
        perm: ["view", "category"],
      },
      {
        title: "Units",
        url: "/dashboard/inventory/units",
        perm: ["view", "unit"],
      },
    ],
  },
  {
    title: "Suppliers",
    url: "/dashboard/suppliers",
    icon: <TruckIcon />,
    perms: [["view", "supplier"]],
    items: [
      { title: "List", url: "/dashboard/suppliers", perm: ["view", "supplier"] },
      {
        title: "Performance",
        url: "/dashboard/suppliers/perf",
        perm: ["view", "supplier"],
      },
    ],
  },
  {
    title: "Purchase Orders",
    url: "/dashboard/purchase-orders",
    icon: <ClipboardListIcon />,
    perms: [
      ["view", "purchase_order"],
      ["receive", "purchase_order"],
    ],
    items: [
      {
        title: "List",
        url: "/dashboard/purchase-orders",
        perm: ["view", "purchase_order"],
      },
      {
        title: "Pending",
        url: "/dashboard/purchase-orders/pending",
        perm: ["view", "purchase_order"],
      },
    ],
  },
  {
    title: "Notifications",
    url: "/dashboard/notifications",
    icon: <BellIcon />,
    // Everyone can read their own notifications; no explicit permission.
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: <Settings2Icon />,
    perms: [
      ["view", "user"],
      ["view", "role"],
      ["view", "permission"],
    ],
    items: [
      { title: "Users", url: "/dashboard/settings/users", perm: ["view", "user"] },
      { title: "Roles", url: "/dashboard/settings/roles", perm: ["view", "role"] },
      {
        title: "Permissions",
        url: "/dashboard/settings/permissions",
        perm: ["view", "permission"],
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GalleryVerticalEndIcon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Qollab</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={platformNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
