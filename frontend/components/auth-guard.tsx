"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { DashboardSkeleton, GlobalLoading } from "@/components/skeletons/app-loading";

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { user, isLoading } = useAuth();

  // Check if current path is public
  const isPublicPath = useMemo(() => {
    return PUBLIC_PATHS.some((path) => pathname?.startsWith(path));
  }, [pathname]);

  useEffect(() => {
    if (isLoading) return;

    // 1. Not logged in -> must go to login (unless already on a public path)
    if (!user) {
      if (!isPublicPath && pathname !== "/verify-email") {
        const next = encodeURIComponent(pathname || "/dashboard");
        router.replace(`/login?next=${next}`);
      }
      return;
    }

    // 2. Logged in but not verified -> must go to verify-email
    if (!user.email_verified_at) {
      if (pathname !== "/verify-email") {
        router.replace("/verify-email");
      }
      return;
    }

    // 3. Logged in and verified -> shouldn't be on public auth pages or verify-email
    if (isPublicPath || pathname === "/verify-email") {
      router.replace("/dashboard");
    }
  }, [isLoading, user, pathname, router, isPublicPath]);

  // Don't show skeleton on public paths - let the page render normally
  if (isPublicPath) {
    return <>{children}</>;
  }

  if (isLoading) {
    if (pathname?.startsWith("/dashboard")) {
      return <DashboardSkeleton />;
    }
    return <GlobalLoading />;
  }

  return <>{children}</>;
}
