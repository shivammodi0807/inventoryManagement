"use client";

import * as React from "react";
import { Bell, AlertTriangle, Package, ShoppingCart, Info, CheckCheck, Check, Clock, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks/use-notifications";
import { AppNotification } from "@/types/notification";
import { Button } from "@/components/ui/button";
import {
  Card,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "low_stock":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20">
          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
      );
    case "overstock":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
      );
    case "purchase_order_received":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      );
    default:
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 border border-border/40">
          <Info className="h-5 w-5 text-muted-foreground" />
        </div>
      );
  }
}

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority || priority === "info") return null;
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] px-2 py-0 font-semibold uppercase tracking-widest border-none",
        priority === "critical" ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600"
      )}
    >
      {priority}
    </Badge>
  );
}

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
}) {
  const isUnread = !notification.read_at;
  const { data } = notification;

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-2xl border p-5 transition-all relative group",
        isUnread
          ? "bg-secondary/20 border-primary/20 shadow-sm"
          : "bg-background border-transparent hover:bg-secondary/10",
        data.priority === "critical" && isUnread && "ring-1 ring-rose-500/30",
      )}
    >
      {isUnread && (
        <div className="absolute top-5 right-5 flex items-center gap-2 opacity-100 group-hover:opacity-0 transition-opacity">
          <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
        </div>
      )}

      <NotificationIcon type={data.type} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className={cn("text-sm", isUnread ? "font-semibold text-foreground" : "font-semibold text-muted-foreground/70")}>
              {data.title}
            </p>
            <PriorityBadge priority={data.priority} />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest whitespace-nowrap">
            <Clock className="size-3" />
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </div>
        </div>
        <p className={cn("text-sm leading-relaxed", isUnread ? "text-muted-foreground font-medium" : "text-muted-foreground/50 font-medium italic line-clamp-1")}>
          {data.message}
        </p>
        {data.action_url && (
          <div className="mt-3">
            <Link
              href={data.action_url}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary hover:text-primary/80 hover:underline transition-all"
              onClick={() => isUnread && onMarkRead(notification.id)}
            >
              System Interface <Check className="size-3" />
            </Link>
          </div>
        )}
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 self-center">
        {isUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 rounded-lg font-semibold text-[10px] uppercase tracking-widest hover:bg-primary/10 hover:text-primary gap-1.5"
            onClick={() => onMarkRead(notification.id)}
          >
            Clear <Check className="size-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState<"all" | "unread">("all");

  const { data, isLoading } = useNotifications(page, 15, filter === "unread");
  const markAsRead = useMarkAsRead();
  const markAll = useMarkAllAsRead();

  const notifications = data?.data ?? [];
  const unreadCount = data?.total_unread ?? 0;

  return (
    <div className="flex flex-col gap-8 pb-8 max-w-5xl mx-auto px-4">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Bell className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Signal Intelligence</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Notifications</h1>
          <p className="text-base text-muted-foreground font-medium">
            Real-time feed of operational alerts and supply chain events.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            className="h-11 px-6 rounded-xl font-semibold gap-2 border-primary/20 text-primary hover:bg-primary/5 transition-all shadow-sm"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            <CheckCheck className="size-4" /> Clear All Signals
          </Button>
        )}
      </div>

      {/* Control Strip */}
      <div className="flex items-center justify-between px-2">
        <Tabs value={filter} onValueChange={(v) => { setFilter(v as "all" | "unread"); setPage(1); }} className="w-fit">
          <TabsList className="bg-secondary/40 p-1 rounded-xl h-12">
            <TabsTrigger value="all" className="rounded-lg px-6 font-semibold text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">All Signals</TabsTrigger>
            <TabsTrigger value="unread" className="rounded-lg px-6 font-semibold text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
              Unread
              {unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground border-none text-[10px] px-1.5 h-4.5 min-w-[18px] flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="hidden md:flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/40">
          <Sparkles className="size-3" /> System Synchronized
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="premium-card border-none shadow-premium h-24 animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20">
            <EmptyState
              title={filter === "unread" ? "Zero Unread Signals" : "Operational Silence"}
              description={filter === "unread"
                ? "All critical intelligence has been ingested. No pending unread signals."
                : "The system registry is currently devoid of alerts. Operational parity achieved."
              }
              icon={<Bell className="size-12 text-muted-foreground/30" />}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n) => (
              <NotificationRow
                key={n.id}
                notification={n}
                onMarkRead={(id) => markAsRead.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.last_page > 1 && (
        <div className="flex justify-center pt-8">
          <Pagination>
            <PaginationContent className="bg-secondary/20 p-1.5 rounded-2xl border border-border/40">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                  className={cn("rounded-xl h-10 px-4 font-semibold text-[10px] uppercase tracking-widest", page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-background")}
                />
              </PaginationItem>
              <div className="flex items-center gap-1 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Page {page} <span className="mx-2 text-border">/</span> {data.last_page}
              </div>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page < data.last_page) setPage(page + 1); }}
                  className={cn("rounded-xl h-10 px-4 font-semibold text-[10px] uppercase tracking-widest", page >= data.last_page ? "pointer-events-none opacity-50" : "hover:bg-background")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
