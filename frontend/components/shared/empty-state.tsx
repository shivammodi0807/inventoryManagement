"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = <Search className="h-10 w-10 text-muted-foreground/40" />,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/50 p-16 text-center bg-secondary/5 transition-all",
      className
    )}>
      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-background shadow-sm border border-border/50 animate-in zoom-in duration-500">
        {icon}
      </div>
      <h3 className="mt-6 text-xl font-semibold tracking-tight text-foreground/90">{title}</h3>
      {description && (
        <p className="mt-2 text-base text-muted-foreground font-semibold max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button 
          onClick={action.onClick} 
          className="mt-8 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 font-semibold px-8 rounded-xl h-11"
        >
          <Plus className="mr-2 h-4 w-4" />
          {action.label}
        </Button>
      )}
    </div>
  );
}
