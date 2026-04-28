import axiosApi from "./axiosApi";
import type { User } from "@/types";

export type LoginCredentials = {
  email: string;
  password: string;
};

export const getCsrfCookie = async (): Promise<void> => {
  await axiosApi.get("/sanctum/csrf-cookie");
};

export const loginRequest = async (data: LoginCredentials): Promise<User> => {
  await getCsrfCookie();
  const res = await axiosApi.post<User>("/api/login", data);
  return res.data;
};

export const getUser = async (): Promise<User> => {
  const res = await axiosApi.get<User>("/api/user");
  return res.data;
};

export const logoutRequest = async (): Promise<void> => {
  await axiosApi.post("/api/logout");
};

export type ForgotPasswordPayload = { email: string };

export type ResetPasswordPayload = {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export const forgotPasswordRequest = async (
  data: ForgotPasswordPayload,
): Promise<{ status: string; message: string }> => {
  const res = await axiosApi.post("/api/password/forgot", data);
  return res.data;
};

export const resetPasswordRequest = async (
  data: ResetPasswordPayload,
): Promise<{ status: string; message: string }> => {
  const res = await axiosApi.post("/api/password/reset", data);
  return res.data;
};

export type UpdateProfilePayload = {
  full_name: string;
  email: string;
};

export const updateProfile = async (
  data: UpdateProfilePayload,
): Promise<User> => {
  const res = await axiosApi.put<User>("/api/user/profile", data);
  return res.data;
};

export type ChangePasswordPayload = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export const changePassword = async (
  data: ChangePasswordPayload,
): Promise<{ status: string }> => {
  const res = await axiosApi.put("/api/user/password", data);
  return res.data;
};

// ========== Phase G: Registration & Email Verification ==========

export type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export const registerRequest = async (data: RegisterPayload): Promise<User> => {
  await getCsrfCookie();
  const res = await axiosApi.post<User>("/api/register", data);
  return res.data;
};

// id + hash come from the URL path; expires + signature come from the query
// string. Both pairs must be forwarded verbatim — Laravel's signed middleware
// re-derives the HMAC from them.
export type VerifyEmailParams = {
  id: string;
  hash: string;
  expires: string;
  signature: string;
};

export const verifyEmailRequest = async (
  p: VerifyEmailParams,
): Promise<{ message: string; already_verified: boolean }> => {
  const res = await axiosApi.post(
    `/api/email/verify/${p.id}/${p.hash}?expires=${encodeURIComponent(p.expires)}&signature=${encodeURIComponent(p.signature)}`,
  );
  return res.data;
};

export const resendVerificationRequest = async (): Promise<{
  message: string;
}> => {
  const res = await axiosApi.post("/api/email/verification-notification");
  return res.data;
};
