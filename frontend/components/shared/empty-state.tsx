"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  icon = <Search className="h-10 w-10 text-muted-foreground" />,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center ${className}`}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          <Plus className="mr-2 h-4 w-4" />
          {action.label}
        </Button>
      )}
    </div>
  );
}
