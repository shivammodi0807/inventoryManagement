"use client"

import Link from "next/link"

import { useAuth } from "@/hooks/use-auth"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Bell,
  ChevronsUpDown,
  LogOut,
  Moon,
  Sun,
  User,
  Settings,
  Sparkles
} from "lucide-react"
import { useTheme } from "next-themes"

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0][0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : ""
  return (first + last).toUpperCase()
}

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, logout, logoutLoading } = useAuth()
  const { theme, setTheme } = useTheme()

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-3 px-2 py-2">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-2 w-1/2" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const initials = getInitials(user.full_name)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all duration-300 h-14 group rounded-xl"
            >
              <div className="relative">
                <Avatar className="h-9 w-9 rounded-xl border-2 border-border/50 group-hover:border-primary/50 transition-colors">
                  <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-semibold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-emerald-500 rounded-full border-2 border-sidebar shadow-sm" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                <span className="truncate font-semibold text-foreground">{user.full_name}</span>
                <span className="truncate text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">{user.role?.name || 'Administrator'}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-2xl p-2 shadow-premium border-border/40"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={12}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-3 text-left">
                <Avatar className="h-10 w-10 rounded-xl border border-border/50">
                  <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-foreground">
                    {user.full_name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem asChild className="rounded-xl px-3 py-2 cursor-pointer focus:bg-primary/5 focus:text-primary">
                <Link href="/dashboard/account" className="flex items-center w-full">
                  <User className="mr-3 size-4 opacity-70" />
                  <span className="font-semibold">My Profile</span>
                  <Sparkles className="ml-auto size-3 text-amber-500 animate-pulse" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl px-3 py-2 cursor-pointer focus:bg-primary/5 focus:text-primary">
                <Link href="/dashboard/notifications" className="flex items-center w-full">
                  <Bell className="mr-3 size-4 opacity-70" />
                  <span className="font-semibold">Notifications</span>
                  <div className="ml-auto size-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-semibold">
                    12
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl px-3 py-2 cursor-pointer focus:bg-primary/5 focus:text-primary">
                <Link href="/dashboard/settings" className="flex items-center w-full">
                  <Settings className="mr-3 size-4 opacity-70" />
                  <span className="font-semibold">Workspace Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="rounded-xl px-3 py-2 cursor-pointer focus:bg-primary/5 focus:text-primary"
              >
                {theme === "light" ? <Moon className="mr-3 size-4 opacity-70" /> : <Sun className="mr-3 size-4 opacity-70" />}
                <span className="font-semibold">Appearance</span>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                  {theme === "light" ? "Dark" : "Light"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem
              disabled={logoutLoading}
              onSelect={(event) => {
                event.preventDefault()
                logout()
              }}
              className="rounded-xl px-3 py-2 cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
            >
              <LogOut className="mr-3 size-4 opacity-70" />
              <span className="font-medium">{logoutLoading ? "Terminating Session..." : "Sign Out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
