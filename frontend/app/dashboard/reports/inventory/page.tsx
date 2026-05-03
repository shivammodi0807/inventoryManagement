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
import { Download, ChevronLeft, Package2 } from "lucide-react";
import Link from "next/link";

export default function InventoryValuationPage() {
  const { data, isLoading } = useInventoryValuation();

  const handleDownload = () => {
    window.open(getReportExportUrl("inventory-valuation"), "_blank");
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-[300px]" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!data || !data.totals) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Package2 className="h-12 w-12 text-muted-foreground opacity-20" />
        <div className="text-xl font-medium text-muted-foreground">Unable to load report data</div>
        <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/reports"><ChevronLeft className="h-4 w-4" /></Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Inventory Valuation</h2>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Breakdown of asset value across all categories.</p>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" /> Export PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Total Units</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totals.stock.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Cost Basis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totals.cost_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Retail Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totals.retail_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-emerald-600">Potential Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">${data.totals.potential_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Valuation by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Total Stock</TableHead>
                <TableHead className="text-right">Avg Cost</TableHead>
                <TableHead className="text-right">Total Cost Value</TableHead>
                <TableHead className="text-right">Total Retail Value</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.breakdown.map((item: any) => {
                const margin = item.total_retail_value > 0 
                  ? ((item.total_retail_value - item.total_cost_value) / item.total_retail_value) * 100 
                  : 0;
                
                return (
                  <TableRow key={item.category_name}>
                    <TableCell className="font-medium">{item.category_name || "Uncategorized"}</TableCell>
                    <TableCell className="text-right">{Number(item.total_stock).toLocaleString()}</TableCell>
                    <TableCell className="text-right">${(item.total_cost_value / (item.total_stock || 1)).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">${Number(item.total_cost_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right font-medium">${Number(item.total_retail_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-bold">{margin.toFixed(1)}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
