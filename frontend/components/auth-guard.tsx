"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

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

  // if (isLoading || !user) {
  if (isLoading) {
    return (
      <div className="flex h-svh w-full items-center justify-center">
        <div className="flex w-full max-w-md flex-col gap-3 p-6">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
