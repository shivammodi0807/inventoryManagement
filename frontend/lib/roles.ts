import { User } from "@/types/user";

export const isAdmin = (user?: User) => user?.role === "admin";
export const isManager = (user?: User) => user?.role === "manager";
export const isStaff = (user?: User) => user?.role === "staff";
