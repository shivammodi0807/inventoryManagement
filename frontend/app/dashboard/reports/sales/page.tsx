"use client";

import React, { useState } from "react";
import { useSalesPerformance, getReportExportUrl } from "@/hooks/use-reports";
import { ReportFilter } from "@/components/reports/report-filter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, TrendingUp, ShoppingBag, DollarSign, Download, Activity, ArrowUpRight } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function SalesPerformancePage() {
  const [period, setPeriod] = useState("month");
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });

  const { data, isLoading } = useSalesPerformance(
    period,
    period === "custom" ? dateRange.from : undefined,
    period === "custom" ? dateRange.to : undefined
  );

  const handleDownload = () => {
    const params: Record<string, string> = { period };
    if (period === "custom") {
      params.from = dateRange.from;
      params.to = dateRange.to;
    }
    window.open(getReportExportUrl("sales-performance", params), "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 pb-8">
        <div className="space-y-1 px-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-16 rounded-2xl mx-2" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-7">
          <Skeleton className="col-span-4 h-[400px] rounded-2xl" />
          <Skeleton className="col-span-3 h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data || !data.summary) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <TrendingUp className="h-12 w-12 text-muted-foreground opacity-20" />
        <div className="text-xl font-semibold text-muted-foreground">Unable to synthesize sales data</div>
        <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl font-semibold">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Premium Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <ChevronLeft className="h-5 w-5 cursor-pointer hover:text-primary/70" onClick={() => window.history.back()} />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Intelligence Reports</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Revenue Intelligence</h1>
          <p className="text-base text-muted-foreground font-medium">
            Deep-dive analytics into sales performance and market trajectory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 px-4 rounded-xl border-border/40 font-semibold gap-2 hover:bg-background transition-all" onClick={handleDownload}>
            <Download className="size-4" /> Export Analytics
          </Button>
        </div>
      </div>

      <div className="px-2">
        <ReportFilter
          period={period}
          setPeriod={setPeriod}
          onDownload={handleDownload}
          dateRange={dateRange}
          setDateRange={setDateRange}
          className="bg-secondary/20 p-2 rounded-2xl border border-border/40"
        />
      </div>

      {/* KPI Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <SalesKPICard
          title="Consolidated Revenue"
          value={`$${data.summary.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Gross revenue for period"
          icon={<DollarSign className="size-5" />}
          color="blue"
        />
        <SalesKPICard
          title="Fulfillment Volume"
          value={data.summary.total_orders}
          subtitle="Completed order transactions"
          icon={<ShoppingBag className="size-5" />}
          color="emerald"
        />
        <SalesKPICard
          title="Yield Per Transaction"
          value={`$${data.summary.avg_order_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Average basket valuation"
          icon={<Activity className="size-5" />}
          color="indigo"
        />
      </div>

      {/* Analytics Matrix */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 premium-card border-none shadow-premium bg-background">
          <CardHeader className="border-b border-border/40 pb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold tracking-tight">Revenue Trajectory</CardTitle>
                <CardDescription className="text-sm text-muted-foreground font-medium">Daily intake and growth patterns</CardDescription>
              </div>
              <Badge className="font-semibold bg-primary/10 text-primary border-none text-[10px] uppercase tracking-widest px-3">Live Feed</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-8 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily_sales}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 600 }}
                  tickFormatter={(str) => str ? format(new Date(str), 'MMM d') : ''}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 600 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="premium-card p-3 border-border/40 shadow-premium bg-background/95 backdrop-blur-md">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
                            {label ? format(new Date(label), 'MMMM d, yyyy') : 'No Date'}
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            Revenue: <span className="text-primary">${Number(payload[0].value).toLocaleString()}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3 premium-card border-none shadow-premium bg-background">
          <CardHeader className="border-b border-border/40 pb-6">
            <CardTitle className="text-xl font-semibold tracking-tight">Product Dominance</CardTitle>
            <CardDescription className="text-sm text-muted-foreground font-medium">Top performing assets by gross revenue</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {data.top_products.map((product, idx) => (
                <div key={product.sku} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-secondary/40 transition-all border border-transparent hover:border-border/40 group">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-semibold text-xs border border-primary/10 group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-semibold text-foreground tracking-tight truncate max-w-[160px]">{product.name}</p>
                      <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">{product.units_sold} Units Sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-foreground tabular-nums">
                      ${Number(product.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[9px] font-semibold text-primary flex items-center justify-end gap-0.5 uppercase tracking-tighter">
                      Product IQ <ArrowUpRight className="size-2.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface SalesKPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "indigo";
}

function SalesKPICard({ title, value, subtitle, icon, color }: SalesKPICardProps) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  };

  return (
    <Card className="premium-card border-none shadow-premium relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{title}</CardTitle>
          <div className={cn("p-2 rounded-xl border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", colorMap[color])}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-3xl font-semibold tracking-tighter tabular-nums text-foreground">
            {value}
          </div>
          <p className="text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-widest">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}
