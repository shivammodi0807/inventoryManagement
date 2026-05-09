import { Badge } from "@/components/ui/badge";
import { PurchaseOrderStatus } from "@/types/purchase-order";
import { cn } from "@/lib/utils";

interface POStatusBadgeProps {
  status: PurchaseOrderStatus;
  className?: string;
}

export function POStatusBadge({ status, className }: POStatusBadgeProps) {
  const configs: Record<string, { label: string; className: string; dot: string }> = {
    [PurchaseOrderStatus.Draft]: { 
      label: "Draft", 
      className: "bg-secondary/50 text-secondary-foreground border-border/50",
      dot: "bg-secondary-foreground/40"
    },
    [PurchaseOrderStatus.Submitted]: { 
      label: "Submitted", 
      className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      dot: "bg-blue-500"
    },
    [PurchaseOrderStatus.Confirmed]: { 
      label: "Confirmed", 
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      dot: "bg-amber-500"
    },
    [PurchaseOrderStatus.PartiallyReceived]: { 
      label: "Partial", 
      className: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      dot: "bg-indigo-500"
    },
    [PurchaseOrderStatus.Received]: { 
      label: "Received", 
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      dot: "bg-emerald-500"
    },
    [PurchaseOrderStatus.Cancelled]: { 
      label: "Cancelled", 
      className: "bg-destructive/10 text-destructive border-destructive/20",
      dot: "bg-destructive"
    },
  };

  const config = configs[status] || { 
    label: status.toUpperCase(), 
    className: "bg-muted text-muted-foreground border-border/50",
    dot: "bg-muted-foreground/40"
  };

  return (
    <Badge className={cn(
      "px-2 py-0.5 rounded-full font-semiboldbold text-[10px] uppercase tracking-wider flex items-center gap-1.5 border shadow-none", 
      config.className,
      className
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot, status !== PurchaseOrderStatus.Cancelled && "animate-pulse")} />
      {config.label}
    </Badge>
  );
}
