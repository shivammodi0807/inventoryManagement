"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading the data. Please try again.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
        {message}
      </p>
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry} 
          className="mt-6 border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
