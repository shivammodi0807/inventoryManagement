"use client";

import * as React from "react";
import { Bell, AlertTriangle, Package, ShoppingCart, Info, CheckCheck, Check } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";

import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks/use-notifications";
import { AppNotification } from "@/types/notification";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "low_stock":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </div>
      );
    case "overstock":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
      );
    case "purchase_order_received":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
      );
    default:
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
      );
  }
}

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority || priority === "info") return null;
  return (
    <Badge
      variant={priority === "critical" ? "destructive" : "secondary"}
      className="text-[11px] px-1.5 py-0 capitalize"
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
        "flex items-start gap-4 rounded-lg border p-4 transition-all",
        isUnread
          ? "bg-muted/40 border-border hover:bg-muted/60"
          : "bg-background border-transparent hover:bg-muted/20",
        data.priority === "critical" && isUnread && "border-l-4 border-l-destructive",
        data.priority === "warning" && isUnread && "border-l-4 border-l-orange-400"
      )}
    >
      <NotificationIcon type={data.type} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={cn("text-sm", isUnread ? "font-semibold" : "font-medium text-muted-foreground")}>
              {data.title}
            </p>
            <PriorityBadge priority={data.priority} />
          </div>
          <time
            className="shrink-0 text-xs text-muted-foreground whitespace-nowrap"
            title={format(new Date(notification.created_at), "PPpp")}
          >
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </time>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{data.message}</p>
        {data.action_url && (
          <Link
            href={data.action_url}
            className="mt-2 inline-flex text-xs text-primary hover:underline font-medium"
            onClick={() => isUnread && onMarkRead(notification.id)}
          >
            View details →
          </Link>
        )}
      </div>

      {isUnread && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 rounded-full"
          title="Mark as read"
          onClick={() => onMarkRead(notification.id)}
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState<"all" | "unread">("all");

  const { data, isLoading } = useNotifications(page, 15);
  const markAsRead = useMarkAsRead();
  const markAll = useMarkAllAsRead();

  const notifications = data?.data ?? [];

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay up to date with stock alerts and system events.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={(v) => { setFilter(v as any); setPage(1); }}>
        <TabsList className="w-fit">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <DataTableSkeleton columnCount={1} rowCount={8} />
          ) : (() => {
            const filteredNotifications = notifications.filter((n) => filter === "all" || !n.read_at);
            
            if (filteredNotifications.length === 0) {
              return (
                <EmptyState
                  title={filter === "unread" ? "No unread notifications" : "No notifications"}
                  description={filter === "unread" 
                    ? "You've read all your notifications. Great job!" 
                    : "You're all caught up. New alerts will appear here automatically."
                  }
                  icon={<Bell className="h-10 w-10 text-muted-foreground" />}
                />
              );
            }

            return (
              <div className="flex flex-col gap-2">
                {filteredNotifications.map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    onMarkRead={(id) => markAsRead.mutate(id)}
                  />
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.last_page > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {[...Array(data.last_page)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage(i + 1); }}
                    isActive={page === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page < data.last_page) setPage(page + 1); }}
                  className={page >= data.last_page ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
