"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Uncaught error:", error);
  }, [error]);

  return (
    <div className="flex h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-full bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
        <p className="max-w-[500px] text-muted-foreground">
          An unexpected error occurred. We've logged the details and are working to fix it.
          In the meantime, you can try refreshing the page.
        </p>
      </div>
      
      {error.message && (
        <div className="rounded-md bg-muted p-4 font-mono text-sm max-w-2xl overflow-auto">
          {error.message}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Refresh Page
        </Button>
        <Button onClick={() => reset()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
