"use client";

import { useLowStockReport } from "@/hooks/use-reports";
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
import { ChevronLeft, AlertCircle, ShoppingCart, Download, Package, Activity } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getReportExportUrl } from "@/hooks/use-reports";
import { LowStockReportItem } from "@/types/reports";

export default function LowStockReportPage() {
  const { data, isLoading, isError, refetch } = useLowStockReport();

  const handleDownload = () => {
    window.open(getReportExportUrl("low-stock"), "_blank");
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
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-[500px] rounded-2xl" />
      </div>
    );
  }

  if (isError || !data || !Array.isArray(data)) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground opacity-20" />
        <div className="text-xl font-semibold text-muted-foreground">Unable to synchronize stock data</div>
        <Button variant="outline" onClick={() => refetch()} className="rounded-xl font-semibold">Try Again</Button>
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
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Supply Risk Matrix</h1>
          <p className="text-base text-muted-foreground font-medium">
            Identifying assets below safety threshold requiring immediate reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 px-4 rounded-xl border-border/40 font-semibold gap-2 hover:bg-background transition-all" onClick={handleDownload}>
            <Download className="size-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="premium-card bg-amber-500/5 border-amber-500/20 shadow-premium relative overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-amber-600/60">Risk Exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold text-amber-600 tabular-nums">{data.length}</div>
                <p className="text-[10px] text-amber-600/70 font-semibold uppercase tracking-widest mt-1">Critical Stock Alerts</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <AlertCircle className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-premium relative overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Consolidated Shortage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold text-foreground tabular-nums">
                  {data.reduce((acc, item) => acc + (item.reorder_quantity || 0), 0).toLocaleString()}
                </div>
                <p className="text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-widest mt-1">Total Units Required</p>
              </div>
              <div className="p-2.5 rounded-xl bg-secondary text-muted-foreground border border-border/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Package className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-premium relative overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Vendor Dependency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold text-foreground tabular-nums">
                  {new Set(data.map(i => i.preferred_supplier).filter(Boolean)).size}
                </div>
                <p className="text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-widest mt-1">Active Sourcing Nodes</p>
              </div>
              <div className="p-2.5 rounded-xl bg-secondary text-muted-foreground border border-border/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Activity className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Table */}
      <Card className="premium-card border-none shadow-premium overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-secondary/10 pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight">Restock Registry</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">Prioritized replenishment parameters by SKU</p>
            </div>
            <Badge className="font-semibold bg-amber-500/10 text-amber-600 border-none text-[10px] uppercase tracking-widest px-3">Priority: High</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="py-5 px-6 font-semibold text-[11px] uppercase tracking-widest">Product Intelligence</TableHead>
                  <TableHead className="text-right font-semibold text-[11px] uppercase tracking-widest">Available</TableHead>
                  <TableHead className="text-right font-semibold text-[11px] uppercase tracking-widest">Threshold</TableHead>
                  <TableHead className="text-right font-semibold text-[11px] uppercase tracking-widest">Deficit</TableHead>
                  <TableHead className="font-semibold text-[11px] uppercase tracking-widest">Strategic Supplier</TableHead>
                  <TableHead className="text-right px-6 font-semibold text-[11px] uppercase tracking-widest">Restock Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Activity className="h-8 w-8 opacity-20" />
                        <p className="font-semibold text-foreground">Operational Equilibrium Achieved</p>
                        <p className="text-xs">No assets are currently below their safety threshold.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item: LowStockReportItem) => (
                    <TableRow key={item.id} className="hover:bg-secondary/20 border-border/40 transition-colors group">
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-foreground tracking-tight leading-none">{item.name}</span>
                          <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest mt-1">{item.sku}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold tabular-nums text-destructive bg-destructive/5 px-2 py-1 rounded-lg border border-destructive/10">{item.total_stock}</span>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-muted-foreground">
                        {item.reorder_point}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold tabular-nums text-amber-600">{item.reorder_quantity}</span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-semibold text-foreground/80 tracking-tight">{item.preferred_supplier || "No Strategic Link"}</div>
                          <div className="text-[10px] text-muted-foreground font-medium">{item.supplier_email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <Button size="sm" variant="outline" asChild className="rounded-lg h-9 font-semibold px-4 border-border/60 hover:bg-primary hover:text-white hover:border-primary transition-all">
                          <Link href={`/dashboard/purchase-orders/create?product_id=${item.id}`}>
                            <ShoppingCart className="h-3.5 w-3.5 mr-2" /> Restock
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
