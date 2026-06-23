"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck, AlertTriangle, Package, ShoppingCart, Info, Loader2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

import { useUnreadCount, useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";
import { getEcho } from "@/lib/echo";
import { getCsrfCookie } from "@/lib/auth";
import { AppNotification } from "@/types/notification";
import { quickCreatePurchaseOrder } from "@/lib/purchase-orders";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function getNotificationIcon(type: string) {
  switch (type) {
    case "low_stock":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case "overstock":
      return <Package className="h-4 w-4 text-blue-500" />;
    case "purchase_order_received":
      return <ShoppingCart className="h-4 w-4 text-green-500" />;
    default:
      return <Info className="h-4 w-4 text-muted-foreground" />;
  }
}

function getPriorityClass(priority?: string, isUnread?: boolean) {
  if (!isUnread) return "";
  switch (priority) {
    case "critical":
      return "border-l-2 border-l-destructive";
    case "warning":
      return "border-l-2 border-l-orange-400";
    default:
      return "border-l-2 border-l-primary";
  }
}

export function NotificationBell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: notificationsData } = useNotifications(1, 10);
  const markAsReadMutation = useMarkAsRead();
  const markAllMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = notificationsData?.data ?? [];

  // Real-time: subscribe to the user's private channel via Reverb
  React.useEffect(() => {
    if (!user?.id) return;

    // Ensure session cookies are fresh before subscribing
    getCsrfCookie().then(() => {
      const echo = getEcho();
      if (!echo) return;

      const channel = echo.private(`App.Models.Auth.User.${user.id}`);

      channel.notification((notification: AppNotification & { title?: string; message?: string }) => {
        // Laravel Echo broadcasts the notification payload directly at the root, 
        // while the API returns it inside a 'data' property.
        const payload = notification.data || (notification as unknown as AppNotification["data"]);

        // Show real-time toast
        toast.info(payload.title || "New Notification", {
          description: payload.message,
          action: {
            label: "View",
            onClick: () => {
              setOpen(true);
            },
          },
        });

        // Invalidate queries so the bell count and dropdown update immediately
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
      });
    });

    return () => {
      const echo = getEcho();
      echo?.leave(`App.Models.Auth.User.${user.id}`);
    };
  }, [user?.id, queryClient]);

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  const autoPoMutation = useMutation({
    mutationFn: quickCreatePurchaseOrder,
    onSuccess: () => {
      toast.success("Purchase Order generated successfully!");
      setOpen(false);
      // Optional: router.push(`/dashboard/purchase-orders/${data.data.id}`);
    },
    onError: () => {
      toast.error("Failed to generate Purchase Order");
    },
  });

  const handleApproveAutoPO = (e: React.MouseEvent, n: AppNotification) => {
    e.stopPropagation();
    if (n.data.suggested_data) {
      autoPoMutation.mutate({
        supplier_id: n.data.suggested_data.supplier_id,
        product_id: n.data.product_id!,
        quantity: n.data.suggested_data.quantity,
        cost_price: n.data.suggested_data.cost_price,
      });
      if (!n.read_at) markAsReadMutation.mutate(n.id);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          id="notification-bell"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semiboldbold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-[380px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => {
                const isUnread = !n.read_at;
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50 cursor-pointer group",
                      isUnread && "bg-muted/30",
                      getPriorityClass(n.data.priority, isUnread)
                    )}
                    onClick={() => {
                      if (isUnread) markAsReadMutation.mutate(n.id);
                    }}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getNotificationIcon(n.data.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm leading-snug", isUnread && "font-medium")}>
                        {n.data.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.data.message}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                      {n.data.type === "low_stock" && n.data.can_auto_po && (
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 text-xs bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                            onClick={(e) => handleApproveAutoPO(e, n)}
                            disabled={autoPoMutation.isPending}
                          >
                            {autoPoMutation.isPending ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                              <ShoppingCart className="mr-1 h-3 w-3" />
                            )}
                            Approve & Generate PO
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center justify-start gap-2 shrink-0 ml-2">
                      {isUnread && (
                        <button
                          className="h-2 w-2 rounded-full bg-primary"
                          title="Mark as read"
                          onClick={(e) => handleMarkAsRead(e, n.id)}
                        />
                      )}
                      <button
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Dismiss"
                        onClick={(e) => handleDelete(e, n.id)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                asChild
              >
                <Link href="/dashboard/notifications" onClick={() => setOpen(false)}>
                  View all notifications
                </Link>
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
