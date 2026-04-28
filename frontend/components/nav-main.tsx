"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { type Action, type Resource } from "@/lib/permissions";
import { useAuth } from "@/hooks/use-auth";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ChevronRightIcon } from "lucide-react";

export type NavSubItem = {
  title: string;
  url: string;
  // If omitted, the sub-item is always visible (parent gating already
  // applied). If set, the user must hold this permission too.
  perm?: readonly [Action | string, Resource | string];
};

export type NavItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  // Show this group when the user holds at least one perm in the list.
  // Omit to keep the group always visible.
  perms?: ReadonlyArray<readonly [Action | string, Resource | string]>;
  items?: NavSubItem[];
};

export function NavMain({
  label = "Platform",
  items,
}: {
  label?: string;
  items: NavItem[];
}) {
  const pathname = usePathname();
  const { can, canAny } = useAuth();

  const visible = items
    .filter((item) => !item.perms || canAny(item.perms))
    .map((item) => ({
      ...item,
      items: item.items?.filter((sub) => !sub.perm || can(...sub.perm)),
    }))
    // Drop groups whose only children were filtered out.
    .filter((item) => !item.items || item.items.length > 0 || !item.items);

  if (visible.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {visible.map((item) => {
          const isActive =
            pathname === item.url ||
            item.items?.some((s) => pathname.startsWith(s.url));
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                    {item.icon}
                    <span>{item.title}</span>
                    {item.items && item.items.length > 0 && (
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {item.items && item.items.length > 0 && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((sub) => (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === sub.url}
                          >
                            <Link href={sub.url}>
                              <span>{sub.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
