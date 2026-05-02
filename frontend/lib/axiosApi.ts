import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

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
    const data = error.response?.data as any;

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
    if (status === 401 && typeof window !== "undefined" && !isOnPublicPath()) {
      const originalUrl = original?.url || "";
      if (originalUrl.includes("/api/user")) {
        return Promise.resolve(null);
      }
      window.location.replace("/login");
      return Promise.reject(error);
    }

    // Handle other common errors with toasts
    if (typeof window !== "undefined") {
      if (status === 403) {
        toast.error("Permission Denied", {
          description: data?.message || "You don't have permission to perform this action.",
        });
      } else if (status === 404) {
        // Only toast if it's not a generic probe
        if (original?.method !== "get") {
          toast.error("Resource Not Found", {
            description: "The requested resource could not be found.",
          });
        }
      } else if (status === 429) {
        toast.error("Too Many Requests", {
          description: "Please slow down and try again later.",
        });
      } else if (status && status >= 500) {
        toast.error("Server Error", {
          description: "Something went wrong on our end. Please try again later.",
        });
      } else if (error.code === "ECONNABORTED" || !status) {
        toast.error("Connection Error", {
          description: "Could not reach the server. Check your internet connection.",
        });
      }
    }

    return Promise.reject(error);
  },
);

export default axiosApi;
