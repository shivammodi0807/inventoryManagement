"use client";

import { useState } from "react";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { StockMovementChart } from "@/components/dashboard/stock-movement-chart";
import { CategoryValueChart } from "@/components/dashboard/category-value-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  DollarSign,
  AlertTriangle,
  ShoppingCart,
  ShoppingBag,
  Clock,
  History,
  ArrowRight,
  TrendingUp,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardStats();
  const [filter, setFilter] = useState<"all" | "category" | "value">("all");

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="col-span-4 h-[400px] rounded-2xl" />
          <Skeleton className="col-span-3 h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">
              Command Center
            </span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Operational Intelligence
          </h1>
          <p className="text-base text-muted-foreground font-normal">
            Strategic overview of your supply chain and inventory health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-500/20 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Real-time Feed Active
          </div>
          <Button
            variant="outline"
            className="h-10 px-4 rounded-xl border-border/40 font-semibold gap-2 hover:bg-background transition-all"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* KPI Intelligence Strip */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Inventory"
          value={data.kpis.total_skus}
          subtitle="Managed unique SKUs"
          icon={<Package className="size-5" />}
          trend="+2.5%"
          color="indigo"
        />

        <KPICard
          title="Global Valuation"
          value={`$${data.kpis.total_stock_value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          subtitle="Equity in warehouse"
          icon={<DollarSign className="size-5" />}
          trend="+1.2%"
          color="emerald"
        />

        <KPICard
          title="Supply Shortage"
          value={data.kpis.low_stock_count}
          subtitle="Items requiring restock"
          icon={<AlertTriangle className="size-5" />}
          variant={data.kpis.low_stock_count > 0 ? "destructive" : "default"}
          color="amber"
        />

        <KPICard
          title="Monthly Revenue"
          value={`$${data.kpis.monthly_sales?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || "0"}`}
          subtitle="Gross sales performance"
          icon={<ShoppingBag className="size-5" />}
          trend="+18%"
          color="blue"
        />

        <KPICard
          title="Inbound Flow"
          value={data.kpis.open_po_count}
          subtitle="Active procurement"
          icon={<ShoppingCart className="size-5" />}
          color="purple"
        />

        <KPICard
          title="Pending Liquidity"
          value={data.kpis.pending_sales_count || 0}
          subtitle="Sales awaiting capture"
          icon={<Clock className="size-5" />}
          color="orange"
        />

        <KPICard
          title="Audit Trail"
          value={data.kpis.total_logs_count || 0}
          subtitle="Logged system events"
          icon={<History className="size-5" />}
          color="slate"
        />

        <Card className="premium-card bg-destructive/5 border-destructive/20 relative overflow-hidden group hover:bg-destructive/[0.08] transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110">
            <TrendingUp className="size-12" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-destructive/70">
              Critical Stock Risk
            </CardTitle>
            <AlertTriangle className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/reports/forecast" className="block">
              <div className="text-3xl font-semibold text-destructive tabular-nums">
                {data.kpis.stock_out_soon || 0}
              </div>
              <p className="text-[11px] text-destructive/80 mt-1 flex items-center gap-1 font-semibold uppercase tracking-tight">
                Depletion &lt; 7 Days <ArrowRight className="size-3" />
              </p>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Matrix */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 premium-card border-none shadow-premium">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight">
                Flow Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground font-normal">
                Inventory velocity and stock movement trajectory
              </p>
            </div>
            <Badge className="font-semibold bg-primary/10 text-primary border-none text-[10px] uppercase tracking-widest px-3">
              30D Analysis
            </Badge>
          </CardHeader>
          <CardContent className="pt-8">
            <StockMovementChart data={data.charts.stock_movements} />
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3 premium-card border-none shadow-premium">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight">
                Asset Allocation
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">
                Distribution by category taxonomy and valuation
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <Tabs
              value={filter}
              onValueChange={(v) =>
                setFilter(v as "all" | "category" | "value")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-secondary/30 p-1.5 rounded-xl border border-border/40">
                <TabsTrigger
                  value="all"
                  className="rounded-lg font-semibold text-xs data-[state=active]:shadow-sm"
                >
                  Global
                </TabsTrigger>
                <TabsTrigger
                  value="category"
                  className="rounded-lg font-semibold text-xs data-[state=active]:shadow-sm"
                >
                  Category
                </TabsTrigger>
                <TabsTrigger
                  value="value"
                  className="rounded-lg font-semibold text-xs data-[state=active]:shadow-sm"
                >
                  Value
                </TabsTrigger>
              </TabsList>
              <CategoryValueChart data={data.charts.category_value} />
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Operational Widgets */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Intelligence Alert Widget */}
        <Card className="premium-card border-none shadow-premium">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold tracking-tight">
                Supply Chain Alerts
              </CardTitle>
              <p className="text-sm text-muted-foreground font-normal">
                Low stock items requiring immediate reconciliation
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-primary hover:text-primary hover:bg-primary/5 rounded-xl font-semibold"
            >
              <Link
                href="/dashboard/reports/low-stock"
                className="flex items-center gap-1.5"
              >
                Strategic Report <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {data.widgets.low_stock_items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-600">
                  <Package className="size-7" />
                </div>
                <p className="text-base font-semibold text-foreground">
                  Operational Excellence
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">
                  All inventory levels are within their defined optimal
                  parameters.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.widgets.low_stock_items.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-secondary/40 transition-all border border-transparent hover:border-border/40 group cursor-default"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-11 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 font-semibold text-xs border border-orange-500/20 group-hover:scale-110 transition-transform">
                        {item.sku.substring(0, 2)}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground tracking-tight">
                          {item.name}
                        </p>
                        <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
                          {item.sku}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-sm font-semibold text-destructive tabular-nums">
                          {item.total_stock}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tighter">
                          Units
                        </span>
                      </div>
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/30">
                        Min: {item.reorder_point}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Ledger Widget */}
        <Card className="premium-card border-none shadow-premium">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold tracking-tight">
                Operational Ledger
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">
                Real-time chronicle of warehouse operations
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-primary hover:text-primary hover:bg-primary/5 rounded-xl font-semibold"
            >
              <Link
                href="/dashboard/reports/audit-logs"
                className="flex items-center gap-1.5"
              >
                Full Ledger <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              {data.widgets.recent_activity?.map((activity, idx) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 relative group"
                >
                  {idx < (data.widgets.recent_activity?.length || 0) - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-[-14px] w-[1px] bg-border/40" />
                  )}
                  <div
                    className={`mt-1.5 size-[24px] rounded-lg shrink-0 flex items-center justify-center border transition-all group-hover:scale-110 ${
                      activity.change_type === "receipt"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                        : activity.change_type === "sale"
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-600"
                          : "bg-purple-500/10 border-purple-500/20 text-purple-600"
                    }`}
                  >
                    {activity.change_type === "receipt" ? (
                      <Package className="size-3" />
                    ) : activity.change_type === "sale" ? (
                      <ShoppingCart className="size-3" />
                    ) : (
                      <Activity className="size-3" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold tracking-tight text-foreground/90">
                        {activity.product_name}
                      </p>
                      <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-lg uppercase font-semibold tracking-tighter">
                        {formatDistanceToNow(new Date(activity.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-normal">
                      <span className="text-foreground/70 font-semibold">
                        {activity.user_name || "System Core"}
                      </span>
                      executed
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold tracking-widest",
                          activity.change_type === "receipt"
                            ? "bg-emerald-50 text-emerald-600"
                            : activity.change_type === "sale"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-purple-50 text-purple-600",
                        )}
                      >
                        {activity.change_type}
                      </span>
                    </p>
                  </div>
                  <div
                    className={`text-sm font-semibold tabular-nums self-center px-3 py-1 rounded-lg ${
                      activity.quantity_change > 0
                        ? "text-emerald-600 bg-emerald-500/5"
                        : "text-destructive bg-destructive/5"
                    }`}
                  >
                    {activity.quantity_change > 0 ? "+" : ""}
                    {activity.quantity_change}
                  </div>
                </div>
              ))}
              {(!data.widgets.recent_activity ||
                data.widgets.recent_activity.length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <div className="size-14 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
                    <History className="size-7 opacity-20" />
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    Silent Ledger
                  </p>
                  <p className="text-sm mt-1">
                    No recent activities have been recorded in the system.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
  variant?: "default" | "destructive";
  color?: "indigo" | "emerald" | "amber" | "blue" | "purple" | "orange" | "slate";
}

function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  color = "indigo",
}: KPICardProps) {
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    blue: "text-blue-600 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-600 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-600 bg-orange-500/10 border-orange-500/20",
    slate: "text-slate-600 bg-slate-500/10 border-slate-500/20",
  };

  return (
    <Card
      className={`premium-card group hover:scale-[1.02] transition-all duration-500 border-none shadow-premium relative overflow-hidden ${variant === "destructive" ? "bg-destructive/5" : ""}`}
    >
      <div className="absolute -right-4 -top-4 size-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl group-hover:from-primary/10 transition-all" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {title}
        </CardTitle>
        <div
          className={`p-2 rounded-xl transition-all duration-500 border ${colorMap[color] || colorMap.indigo} group-hover:scale-110 group-hover:rotate-6`}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div
              className={`text-3xl font-semibold tracking-tight tabular-nums ${variant === "destructive" ? "text-destructive" : "text-foreground"}`}
            >
              {typeof value === "number" ? value.toLocaleString() : value}
            </div>
            <p className="text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-widest">
              {subtitle}
            </p>
          </div>
          {trend && (
            <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/10">
              <TrendingUp className="size-3" />
              {trend}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
