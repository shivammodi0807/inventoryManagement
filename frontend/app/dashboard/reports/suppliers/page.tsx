"use client";

import React from "react";
import { useSupplierPerformance } from "@/hooks/use-reports";
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
import { ChevronLeft, Truck, CheckCircle, Clock, BarChart, ExternalLink, Download } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getReportExportUrl } from "@/hooks/use-reports";
import { SupplierPerformanceItem, TopPerformerSupplier } from "@/types/reports";

export default function SupplierPerformancePage() {
  const { data, isLoading } = useSupplierPerformance();

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  // Handle new wrapped structure
  const suppliers = data?.suppliers || [];
  const summary = data?.summary || { avg_reliability: 0, fulfillment_rate: 0, avg_lead_time: 0, total_vendors: 0 };
  const topPerformers = data?.top_performers || [];

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Truck className="h-12 w-12 text-muted-foreground opacity-20" />
        <div className="text-xl font-medium text-muted-foreground">Unable to load performance data</div>
        <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'good': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'average': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const exportUrl = getReportExportUrl('supplier-performance');

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/reports"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Supplier Performance</h2>
        </div>
        <Button variant="outline" asChild>
          <a href={exportUrl} download>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </a>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg On-Time Rate</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(summary.avg_reliability)}%</div>
            <Progress value={summary.avg_reliability} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fulfillment Accuracy</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(suppliers.reduce((acc: number, s: SupplierPerformanceItem) => acc + s.fulfillment_rate, 0) / suppliers.length || 0)}%</div>
            <Progress value={suppliers.reduce((acc: number, s: SupplierPerformanceItem) => acc + s.fulfillment_rate, 0) / suppliers.length || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Lead Time</CardTitle>
            <BarChart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avg_lead_time.toFixed(1)} days</div>
            <p className="text-xs text-muted-foreground mt-1">From PO to receipt</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_vendors}</div>
            <p className="text-xs text-muted-foreground mt-1">Managed vendors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Supplier Reliability Index</CardTitle>
            <CardDescription>Detailed breakdown of vendor performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">On-Time %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.slice(0, 5).map((supplier: SupplierPerformanceItem) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell className="text-right">{supplier.total_orders}</TableCell>
                    <TableCell className="text-right">
                      <span className={supplier.on_time_rate < 80 ? "text-red-600 font-medium" : ""}>
                        {supplier.on_time_rate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(supplier.status)}>
                        {supplier.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/suppliers/${supplier.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Performing Vendors</CardTitle>
            <CardDescription>Highest rated based on reliability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {topPerformers.map((supplier: TopPerformerSupplier) => (
              <div key={supplier.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{supplier.name}</span>
                  <span className="text-muted-foreground">{supplier.rating.toFixed(1)} / 5.0</span>
                </div>
                <Progress value={supplier.rating * 20} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
