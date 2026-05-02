"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { GalleryVerticalEndIcon } from "lucide-react";

export function GlobalLoading() {
  return (
    <div className="flex h-svh w-full flex-col items-center justify-center gap-4">
      <div className="flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground animate-pulse">
        <GalleryVerticalEndIcon className="size-8" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex h-svh w-full overflow-hidden">
      {/* Sidebar Skeleton */}
      <div className="hidden w-64 border-r bg-muted/20 md:block">
        <div className="flex h-16 items-center px-6 border-b">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Header Skeleton */}
        <header className="flex h-16 items-center justify-between px-6 border-b">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </header>

        {/* Content Skeleton */}
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>

          <Skeleton className="h-[400px] w-full" />
        </main>
      </div>
    </div>
  );
}
