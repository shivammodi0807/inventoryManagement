"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "System Interruption",
  message = "We encountered an unexpected error while retrieving your data. Our team has been notified.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center rounded-3xl border border-destructive/20 bg-destructive/5 p-12 text-center transition-all",
      className
    )}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-sm animate-bounce duration-1000">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="mt-6 text-xl font-semibold tracking-tight text-destructive">{title}</h3>
      <p className="mt-2 text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button 
          variant="outline" 
          onClick={onRetry} 
          className="mt-8 border-destructive/30 hover:bg-destructive hover:text-destructive-foreground transition-all font-semibold rounded-xl px-6 h-11 shadow-sm"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reconnect System
        </Button>
      )}
    </div>
  );
}
