"use client";

import { useDashboardStats } from "@/hooks/use-dashboard";
import { StockMovementChart } from "@/components/dashboard/stock-movement-chart";
import { CategoryValueChart } from "@/components/dashboard/category-value-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, AlertTriangle, ShoppingCart } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import Link from "next/link";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardStats();

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="col-span-4 h-[400px] rounded-xl" />
          <Skeleton className="col-span-3 h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.total_skus.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              SKUs across all categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.kpis.total_stock_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on unit cost price
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{data.kpis.low_stock_count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Items at or below reorder point
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Purchase Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.open_po_count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending receipt from suppliers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4">
          <StockMovementChart data={data.charts.stock_movements} />
        </div>
        <div className="col-span-1 lg:col-span-3">
          <CategoryValueChart data={data.charts.category_value} />
        </div>
      </div>

      {/* Widgets Row */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Action Needed: Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            {data.widgets.low_stock_items.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6">
                All inventory levels are healthy.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Reorder Point</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.widgets.low_stock_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category_name || "Uncategorized"}</TableCell>
                      <TableCell className="text-right text-red-500 font-bold">
                        {item.total_stock}
                      </TableCell>
                      <TableCell className="text-right">{item.reorder_point}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/inventory/products/${item.id}`}>
                          <Badge variant="outline" className="cursor-pointer hover:bg-muted">View</Badge>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

