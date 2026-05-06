import axiosApi from "./axiosApi";
import { PaginatedNotifications } from "@/types/notification";

export async function getNotifications(params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedNotifications> {
  const res = await axiosApi.get<PaginatedNotifications>("/api/notifications", { params });
  return res.data;
}

export async function getUnreadCount(): Promise<number> {
  const res = await axiosApi.get<{ count: number }>("/api/notifications/unread-count");
  return res.data.count;
}

export async function markAsRead(id: string): Promise<void> {
  await axiosApi.patch(`/api/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await axiosApi.patch("/api/notifications/read-all");
}
