"use client";

import React from "react";
import { useInventoryForecast } from "@/hooks/use-reports";
import { useBulkCreatePurchaseOrders } from "@/hooks/use-purchase-orders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, AlertTriangle, Clock, Calendar, ArrowRight, ShoppingCart, BrainCircuit, BarChart2, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { InventoryForecastItem } from "@/types/reports";
import { cn } from "@/lib/utils";

export default function InventoryForecastPage() {
  const { data, isLoading } = useInventoryForecast();
  const bulkReorder = useBulkCreatePurchaseOrders();
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked && data) {
      setSelectedIds(data.map((p: InventoryForecastItem) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkReorder = () => {
    if (selectedIds.length === 0) return;

    const selections = selectedIds.map(id => {
      const product = data?.find((p: InventoryForecastItem) => p.id === id);
      const velocity = product?.daily_velocity || 1;
      const qty = Math.max(50, Math.ceil(velocity * 30));
      return { product_id: id, qty_to_order: qty };
    });

    bulkReorder.mutate(selections, {
      onSuccess: () => setSelectedIds([]),
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 pb-8">
        <div className="space-y-1 px-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-[500px] rounded-2xl" />
      </div>
    );
  }

  if (!data || !Array.isArray(data)) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <BrainCircuit className="h-12 w-12 text-muted-foreground opacity-20" />
        <div className="text-xl font-semibold text-muted-foreground">Unable to initialize forecasting engine</div>
        <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl font-semiboldbold">Try Again</Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'warning': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'out_of_stock': return 'bg-slate-950 text-white border-slate-950';
      default: return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'critical': return 'Critical (< 7 Days)';
      case 'warning': return 'Imminent (< 14 Days)';
      case 'low': return 'Low (< 30 Days)';
      case 'out_of_stock': return 'Stock Depleted';
      default: return 'Optimal Runway';
    }
  };

  const criticalCount = data.filter((p: InventoryForecastItem) => p.status === 'critical').length;
  const warningCount = data.filter((p: InventoryForecastItem) => p.status === 'warning').length;

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Premium Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <ChevronLeft className="h-5 w-5 cursor-pointer hover:text-primary/70" onClick={() => window.history.back()} />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Intelligence Reports</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Predictive Runway</h1>
          <p className="text-base text-muted-foreground font-medium">
            AI-driven demand projections and stock depletion trajectory analysis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <Button
              onClick={handleBulkReorder}
              disabled={bulkReorder.isPending}
              className="h-12 px-6 rounded-xl bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 font-semiboldbold gap-2 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <ShoppingCart className="size-4" />
              Execute Bulk Procurement ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Forecasting KPI Strip */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className={cn(
          "premium-card border-none shadow-premium relative overflow-hidden group hover:scale-[1.02] transition-all duration-300",
          criticalCount > 0 ? "bg-destructive/5" : ""
        )}>
          <CardHeader className="pb-3">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Risk Vector: Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className={cn("text-3xl font-semibold tabular-nums", criticalCount > 0 ? "text-destructive" : "text-foreground")}>
                  {criticalCount}
                </div>
                <p className="text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-widest mt-1">Depletion &lt; 7 Days</p>
              </div>
              <div className={cn(
                "p-2.5 rounded-xl border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                criticalCount > 0 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-secondary text-muted-foreground border-border/40"
              )}>
                <AlertTriangle className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-premium relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Imminent Depletion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold text-foreground tabular-nums">{warningCount}</div>
                <p className="text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-widest mt-1">Depletion &lt; 14 Days</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Clock className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-premium relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Forecasting Horizon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold text-foreground tabular-nums">30 Days</div>
                <p className="text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-widest mt-1">Rolling Temporal Window</p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Calendar className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Grid */}
      <Card className="premium-card border-none shadow-premium overflow-hidden bg-background">
        <CardHeader className="border-b border-border/40 bg-secondary/10 pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
                <BrainCircuit className="size-5 text-primary" />
                AI Analysis Registry
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground font-medium">Machine learning demand projections based on historical velocity</CardDescription>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-600 text-[10px] font-semibold uppercase tracking-widest rounded-lg border border-indigo-500/20">
              <Sparkles className="size-3" /> Quantum Engine V2
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="w-[60px] px-6">
                    <Checkbox
                      checked={selectedIds.length === data.length && data.length > 0}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </TableHead>
                  <TableHead className="py-5 font-semibold text-[11px] uppercase tracking-widest">Resource Target</TableHead>
                  <TableHead className="text-right font-semibold text-[11px] uppercase tracking-widest">Global Stock</TableHead>
                  <TableHead className="text-right font-semibold text-[11px] uppercase tracking-widest">Safety Buffer</TableHead>
                  <TableHead className="text-right font-semibold text-[11px] uppercase tracking-widest">AI Demand (30D)</TableHead>
                  <TableHead className="text-right font-semibold text-[11px] uppercase tracking-widest">Days Rem.</TableHead>
                  <TableHead className="font-semibold text-[11px] uppercase tracking-widest">Risk Profile</TableHead>
                  <TableHead className="text-right px-6 font-semibold text-[11px] uppercase tracking-widest">Strategic Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((product: InventoryForecastItem) => (
                  <TableRow key={product.id} className={cn(
                    "hover:bg-secondary/20 border-border/40 transition-colors group",
                    selectedIds.includes(product.id) ? "bg-primary/[0.03]" : ""
                  )}>
                    <TableCell className="px-6">
                      <Checkbox
                        checked={selectedIds.includes(product.id)}
                        onCheckedChange={(checked) => handleSelect(product.id, !!checked)}
                        className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-foreground tracking-tight leading-none">{product.name}</span>
                        <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest mt-1">{product.sku}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-foreground/80">
                      {product.current_stock.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="px-2 py-1 rounded-lg bg-indigo-500/5 text-indigo-600 font-semibold tabular-nums border border-indigo-500/10">
                        {product.ai_safety_stock || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-muted-foreground tabular-nums">
                      {product.ai_predicted_demand_30d}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn(
                        "font-semibold tabular-nums text-base",
                        product.days_remaining < 7 ? "text-destructive" :
                          product.days_remaining < 14 ? "text-amber-600" : "text-foreground"
                      )}>
                        {product.days_remaining === 999 ? "∞" : product.days_remaining}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("px-2 py-0.5 rounded-lg font-semibold text-[9px] uppercase tracking-widest border shadow-none", getStatusColor(product.status))}>
                        {getStatusLabel(product.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6 space-x-2 whitespace-nowrap">
                      {product.chart_data && product.chart_data.length > 0 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 px-3 rounded-lg font-semibold gap-1.5 border-border/60 hover:bg-background transition-all">
                              <BarChart2 className="size-3.5" /> Projection
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl premium-card border-none shadow-2xl p-8">
                            <DialogHeader>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                                  <Zap className="size-5" />
                                </div>
                                <div>
                                  <DialogTitle className="text-2xl font-semibold tracking-tight">Demand Projection: {product.name}</DialogTitle>
                                  <DialogDescription className="text-base text-muted-foreground font-medium">Prophet time-series prediction with 95% confidence intervals.</DialogDescription>
                                </div>
                              </div>
                            </DialogHeader>
                            <div className="h-[400px] mt-8 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={product.chart_data}>
                                  <defs>
                                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
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
                                    dy={10}
                                  />
                                  <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 600 }}
                                  />
                                  <RechartsTooltip
                                    content={({ active, payload, label }) => {
                                      if (active && payload && payload.length) {
                                        return (
                                          <div className="premium-card p-3 border-border/40 shadow-premium bg-background/95 backdrop-blur-md">
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">{label}</p>
                                            <p className="text-sm font-semibold text-foreground">Demand: <span className="text-primary">{Number(payload[2].value).toFixed(1)}</span></p>
                                            <p className="text-[10px] text-muted-foreground font-semibold mt-1">Range: {Number(payload[1].value).toFixed(1)} - {Number(payload[0].value).toFixed(1)}</p>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Area type="monotone" dataKey="upper" stackId="1" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.05} name="Upper" />
                                  <Area type="monotone" dataKey="lower" stackId="2" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.05} name="Lower" />
                                  <Line type="monotone" dataKey="demand" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} name="Predicted" />
                                  <Area type="monotone" dataKey="demand" stroke="none" fill="url(#colorDemand)" />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {(product.status === 'critical' || product.status === 'warning' || product.status === 'out_of_stock') && (
                        <Button variant="ghost" size="sm" className="h-9 rounded-lg font-semibold text-primary hover:text-primary hover:bg-primary/5 group/btn" asChild>
                          <Link href={`/dashboard/purchase-orders/new?product_id=${product.id}`} className="flex items-center gap-1.5">
                            Restock <ArrowRight className="size-3.5 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
