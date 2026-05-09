"use client";

import * as React from "react";
import Link from "next/link";

import { NavMain, type NavItem } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  PackageIcon,
  TruckIcon,
  ClipboardListIcon,
  BellIcon,
  Settings2Icon,
  Warehouse as WarehouseIcon,
  ShoppingBag as ShoppingBagIcon,
  BarChart3Icon,
  Sparkles,
} from "lucide-react";

const platformNav: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboardIcon className="size-4" />,
  },
  {
    title: "Inventory",
    url: "/dashboard/inventory",
    icon: <PackageIcon className="size-4" />,
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
    title: "Warehouses",
    url: "/dashboard/warehouses",
    icon: <WarehouseIcon className="size-4" />,
    perms: [["view", "warehouse"]],
    items: [
      {
        title: "All Locations",
        url: "/dashboard/warehouses",
        perm: ["view", "warehouse"],
      },
    ],
  },
  {
    title: "Suppliers",
    url: "/dashboard/suppliers",
    icon: <TruckIcon className="size-4" />,
    perms: [["view", "supplier"]],
  },
  {
    title: "Purchase Orders",
    url: "/dashboard/purchase-orders",
    icon: <ClipboardListIcon className="size-4" />,
    perms: [
      ["view", "purchase_order"],
      ["receive", "purchase_order"],
    ],
    items: [
      {
        title: "All Orders",
        url: "/dashboard/purchase-orders",
        perm: ["view", "purchase_order"],
      },
      {
        title: "Create PO",
        url: "/dashboard/purchase-orders/new",
        perm: ["create", "purchase_order"],
      },
      {
        title: "Pending",
        url: "/dashboard/purchase-orders?status=pending",
        perm: ["view", "purchase_order"],
      },
    ],
  },
  {
    title: "Sales",
    url: "/dashboard/sales",
    icon: <ShoppingBagIcon className="size-4" />,
    items: [
      {
        title: "Customers",
        url: "/dashboard/sales/customers",
      },
      {
        title: "Sales Orders",
        url: "/dashboard/sales/orders",
      },
      {
        title: "Invoices",
        url: "/dashboard/sales/invoices",
      },
    ],
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: <BarChart3Icon className="size-4" />,
    items: [
      { title: "Overview", url: "/dashboard/reports" },
      { title: "Inventory Valuation", url: "/dashboard/reports/inventory" },
      { title: "Sales Analysis", url: "/dashboard/reports/sales" },
      { title: "Low Stock", url: "/dashboard/reports/low-stock" },
      { title: "Inventory Forecasting", url: "/dashboard/reports/forecast" },
      { title: "Supplier Performance", url: "/dashboard/reports/suppliers" },
      { title: "Audit Logs", url: "/dashboard/reports/audit" },
    ],
  },
  {
    title: "Notifications",
    url: "/dashboard/notifications",
    icon: <BellIcon className="size-4" />,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: <Settings2Icon className="size-4" />,
    perms: [
      ["view", "user"],
      ["view", "role"],
      ["view", "permission"],
    ],
    items: [
      {
        title: "Users",
        url: "/dashboard/settings/users",
        perm: ["view", "user"],
      },
      {
        title: "Roles",
        url: "/dashboard/settings/roles",
        perm: ["view", "role"],
      },
      {
        title: "Permissions",
        url: "/dashboard/settings/permissions",
        perm: ["view", "permission"],
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="border-r border-border/50" {...props}>
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-transparent"
            >
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 text-primary-foreground">
                  <Sparkles className="size-5 fill-current" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-lg tracking-tight">Qollab</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Inventory Pro</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <NavMain items={platformNav} />
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-4">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
