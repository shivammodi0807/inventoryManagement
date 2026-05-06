import axiosApi from "./axiosApi";
import type { PaginatedResponse, User } from "@/types";

export type CreateUserPayload = {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  is_active?: boolean;
};

export type UpdateUserPayload = {
  full_name?: string;
  email?: string;
  role_id?: number;
  is_active?: boolean;
  password?: string;
};


export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const res = await axiosApi.post<User>("/api/register", payload);
  return res.data;
};

export const listUsers = async (page = 1): Promise<PaginatedResponse<User>> => {
  const res = await axiosApi.get<PaginatedResponse<User>>("/api/users", {
    params: { page },
  });
  return res.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const res = await axiosApi.get<User>(`/api/users/${id}`);
  return res.data;
};

export const updateUser = async (
  id: number,
  payload: UpdateUserPayload,
): Promise<User> => {
  const res = await axiosApi.put<User>(`/api/users/${id}`, payload);
  return res.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await axiosApi.delete(`/api/users/${id}`);
};
