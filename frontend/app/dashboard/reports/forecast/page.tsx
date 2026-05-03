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
import { ChevronLeft, TrendingUp, AlertTriangle, Clock, Calendar, ArrowRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function InventoryForecastPage() {
  const { data, isLoading } = useInventoryForecast();
  const bulkReorder = useBulkCreatePurchaseOrders();
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked && data) {
      setSelectedIds(data.map((p: any) => p.id));
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

    // Smart Suggestion: Order 30 days of stock, minimum 50 units
    const selections = selectedIds.map(id => {
      const product = data?.find((p: any) => p.id === id);
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
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!data || !Array.isArray(data)) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <TrendingUp className="h-12 w-12 text-muted-foreground opacity-20" />
        <div className="text-xl font-medium text-muted-foreground">Unable to load forecast data</div>
        <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'warning': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'out_of_stock': return 'bg-slate-900 text-white border-slate-900';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'critical': return 'Critical (< 7 days)';
      case 'warning': return 'Warning (< 14 days)';
      case 'low': return 'Low (< 30 days)';
      case 'out_of_stock': return 'Out of Stock';
      default: return 'Healthy';
    }
  };

  const criticalCount = data.filter((p: any) => p.status === 'critical').length;
  const warningCount = data.filter((p: any) => p.status === 'warning').length;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/reports"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Forecasting</h2>
        </div>
        {selectedIds.length > 0 && (
          <Button 
            onClick={handleBulkReorder} 
            disabled={bulkReorder.isPending}
            className="bg-blue-600 hover:bg-blue-700 animate-in fade-in slide-in-from-right-2"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Bulk Reorder ({selectedIds.length})
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* ... existing KPI cards ... */}
        <Card className={criticalCount > 0 ? "border-red-200 bg-red-50/30" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Stock-outs</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${criticalCount > 0 ? "text-red-600" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Expected to run out within 7 days</p>
          </CardContent>
        </Card>
        <Card className={warningCount > 0 ? "border-amber-200 bg-amber-50/30" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Replenishment</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warningCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Expected to run out within 14 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analysis Window</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30 Days</div>
            <p className="text-xs text-muted-foreground mt-1">Based on recent sales velocity</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Runway Analysis</CardTitle>
          <CardDescription>Predictive analysis of product stock based on current sales speed. Select items to generate bulk POs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={selectedIds.length === data.length && data.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Daily Velocity</TableHead>
                <TableHead className="text-right">Days Remaining</TableHead>
                <TableHead>Estimated Stock-out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((product: any) => (
                <TableRow key={product.id} className={selectedIds.includes(product.id) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(product.id)}
                      onCheckedChange={(checked) => handleSelect(product.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.sku}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono">{product.current_stock}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {product.daily_velocity} / day
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {product.days_remaining === 999 ? "∞" : product.days_remaining}
                  </TableCell>
                  <TableCell className="text-muted-foreground italic">
                    {product.estimated_stock_out}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(product.status)}>
                      {getStatusLabel(product.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(product.status === 'critical' || product.status === 'warning' || product.status === 'out_of_stock') && (
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 h-8 gap-1" asChild>
                        <Link href={`/dashboard/inventory/${product.id}`}>
                          Restock <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
