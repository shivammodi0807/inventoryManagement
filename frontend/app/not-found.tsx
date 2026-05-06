"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-full bg-primary/10 p-4 text-primary">
          <Search className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
        <p className="max-w-[500px] text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved
          or deleted, or you might have mistyped the URL.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <Button asChild>
          <Link href="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
