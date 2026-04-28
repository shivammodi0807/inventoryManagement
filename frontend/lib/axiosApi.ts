import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const axiosApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"];

const isOnPublicPath = () => {
  if (typeof window === "undefined") return false;
  return PUBLIC_PATHS.some((p) => window.location.pathname.startsWith(p));
};

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Handle auth + CSRF errors globally
axiosApi.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as RetriableConfig | undefined;

    // 419 = CSRF token mismatch. Refresh the cookie and retry once.
    if (status === 419 && original && !original._retry) {
      original._retry = true;
      try {
        await axiosApi.get("/sanctum/csrf-cookie");
        return axiosApi.request(original);
      } catch {
        // fall through to reject
      }
    }

    // 401 = unauthenticated. Bounce to /login, but never from a public page
    // (otherwise the /api/user probe on the login page causes a redirect loop).
    if (status === 401 && typeof window !== "undefined" && !isOnPublicPath()) {
      const originalUrl = original?.url || "";
      // Don't redirect if this was a user profile fetch - let the caller handle it
      // Return null instead of rejecting so React Query can resolve with null
      if (originalUrl.includes("/api/user")) {
        return Promise.resolve(null);
      }
      window.location.replace("/login");
    }

    return Promise.reject(error);
  },
);

export default axiosApi;
