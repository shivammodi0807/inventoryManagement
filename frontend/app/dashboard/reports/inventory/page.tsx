"use client";

import React from "react";
import { useInventoryValuation, getReportExportUrl } from "@/hooks/use-reports";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, Package2, DollarSign, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValuationItem {
  category_id?: number | null;
  category_name: string | null;
  total_stock: number;
  total_cost_value: number;
  total_retail_value: number;
}

export default function InventoryValuationPage() {
  const { data, isLoading } = useInventoryValuation();

  const handleDownload = () => {
    window.open(getReportExportUrl("inventory-valuation"), "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 pb-8">
        <div className="space-y-1 px-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-[500px] rounded-2xl" />
      </div>
    );
  }

  if (!data || !data.totals) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Package2 className="h-12 w-12 text-muted-foreground opacity-20" />
        <div className="text-xl font-semibold text-muted-foreground">Unable to reconcile report data</div>
        <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl font-semiboldbold">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Header section with refined visual hierarchy */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <ChevronLeft className="h-5 w-5 cursor-pointer hover:text-primary/70" onClick={() => window.history.back()} />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Intelligence Reports</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Asset Valuation</h1>
          <p className="text-base text-muted-foreground font-medium">
            Strategic breakdown of capital distribution across your inventory taxonomy.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 px-4 rounded-xl border-border/40 font-semibold gap-2 hover:bg-background transition-all" onClick={handleDownload}>
            <Download className="size-4" /> Export Ledger
          </Button>
        </div>
      </div>

      {/* KPI Matrix for Valuation Analytics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ValuationKPICard
          title="Consolidated Stock"
          value={data.totals.stock}
          subtitle="Total units in distribution"
          icon={<Package2 className="size-5" />}
          color="indigo"
        />

        <ValuationKPICard
          title="Capital Expenditure"
          value={`$${data.totals.cost_value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          subtitle="Total cost basis valuation"
          icon={<DollarSign className="size-5" />}
          color="blue"
        />

        <ValuationKPICard
          title="Market Projection"
          value={`$${data.totals.retail_value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          subtitle="Estimated gross retail value"
          icon={<TrendingUp className="size-5" />}
          color="purple"
        />

        <ValuationKPICard
          title="Yield Opportunity"
          value={`$${data.totals.potential_profit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          subtitle="Projected gross profitability"
          icon={<Activity className="size-5" />}
          color="emerald"
          isProfit
        />
      </div>

      {/* Breakdown Table with high-density styling */}
      <Card className="premium-card border-none shadow-premium overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-secondary/10 pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight">Taxonomic Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">Performance and valuation metrics by category cluster</p>
            </div>
            <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-widest rounded-lg border border-primary/20">
              Live Reconciliation
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="py-5 px-6 font-semibold text-[11px] uppercase tracking-widest">Taxonomy Category</TableHead>
                  <TableHead className="text-right font-semibold text-[11px] uppercase tracking-widest">Global Stock</TableHead>
                  <TableHead className="text-right font-semibold text-[11px] uppercase tracking-widest">Avg Acquisition</TableHead>
                  <TableHead className="text-right font-semibold text-[11px] uppercase tracking-widest">Cost Exposure</TableHead>
                  <TableHead className="text-right font-semibold text-[11px] uppercase tracking-widest">Market Value</TableHead>
                  <TableHead className="text-right px-6 font-semibold text-[11px] uppercase tracking-widest">Yield Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.breakdown.map((item: ValuationItem) => {
                  const margin = item.total_retail_value > 0
                    ? ((item.total_retail_value - item.total_cost_value) / item.total_retail_value) * 100
                    : 0;

                  return (
                    <TableRow key={item.category_name} className="hover:bg-secondary/20 border-border/40 transition-colors group">
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-secondary flex items-center justify-center border border-border/40 group-hover:scale-110 transition-transform">
                            <Package2 className="size-4 text-muted-foreground" />
                          </div>
                          <span className="font-semibold text-foreground tracking-tight">{item.category_name || "Uncategorized Assets"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-muted-foreground">
                        {Number(item.total_stock).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-muted-foreground">
                        ${(item.total_cost_value / (item.total_stock || 1)).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-foreground">
                        ${Number(item.total_cost_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-foreground">
                        ${Number(item.total_retail_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-[11px] tabular-nums",
                          margin > 30 ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                            margin > 15 ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" :
                              "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                        )}>
                          {margin.toFixed(1)}%
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ValuationKPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: "indigo" | "blue" | "purple" | "emerald";
  isProfit?: boolean;
}

function ValuationKPICard({ title, value, subtitle, icon, color, isProfit }: ValuationKPICardProps) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  };

  return (
    <Card className={cn(
      "premium-card border-none shadow-premium relative overflow-hidden group hover:scale-[1.02] transition-all duration-300",
      isProfit ? "bg-emerald-500/5" : ""
    )}>
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
          <div className={cn(
            "text-3xl font-semibold tracking-tighter tabular-nums",
            isProfit ? "text-emerald-600" : "text-foreground"
          )}>
            {value}
          </div>
          <p className="text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-widest">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}
