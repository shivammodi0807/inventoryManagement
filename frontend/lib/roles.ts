import axiosApi from "./axiosApi";
import type { Role } from "@/types";

export type RolePayload = {
  name: string;
  description?: string;
};

export const listRoles = async (): Promise<Role[]> => {
  const res = await axiosApi.get<{ data: Role[] }>("/api/roles");
  return res.data.data;
};

export const getRoleById = async (id: number): Promise<Role> => {
  const res = await axiosApi.get<Role>(`/api/roles/${id}`);
  return res.data;
};

export const createRole = async (payload: RolePayload): Promise<Role> => {
  const res = await axiosApi.post<Role>("/api/roles", payload);
  return res.data;
};

export const updateRole = async (id: number, payload: RolePayload): Promise<Role> => {
  const res = await axiosApi.put<Role>(`/api/roles/${id}`, payload);
  return res.data;
};

export const deleteRole = async (id: number): Promise<void> => {
  await axiosApi.delete(`/api/roles/${id}`);
};

export const updateRolePermissions = async (
  id: number,
  permissionIds: number[]
): Promise<Role> => {
  const res = await axiosApi.post<Role>(`/api/roles/${id}/permissions`, {
    permission_ids: permissionIds,
  });
  return res.data;
};

// Sealed-role identity check for badge rendering.
export const isAdmin = (roleName?: string) => roleName === "Admin";
export const isGuest = (roleName?: string) => roleName === "Guest";
