import axiosApi from "./axiosApi";

export type LoginCredentials = {
  email: string;
  password: string;
};

export const getCsrfCookie = async () => {
  await axiosApi.get("/sanctum/csrf-cookie");
};

export const loginRequest = async (data: LoginCredentials) => {
  await getCsrfCookie();
  const res = await axiosApi.post("/api/login", data);
  return res.data;
};

export const registerRequest = async (data: Record<string, unknown>) => {
  await getCsrfCookie();
  const res = await axiosApi.post("/api/register", data);
  return res.data;
};

export const getUser = async () => {
  const res = await axiosApi.get("/api/user");
  return res.data;
};

export const logoutRequest = async () => {
  await axiosApi.post("/api/logout");
};
