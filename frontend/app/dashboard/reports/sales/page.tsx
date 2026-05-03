"use client";

import React, { useState } from "react";
import { useSalesPerformance, getReportExportUrl } from "@/hooks/use-reports";
import { ReportFilter } from "@/components/reports/report-filter";
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
import { ChevronLeft, TrendingUp, ShoppingBag, DollarSign } from "lucide-react";
import Link from "next/link";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

import { format, subDays } from "date-fns";

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
    const params: any = { period };
    if (period === "custom") {
        params.from = dateRange.from;
        params.to = dateRange.to;
    }
    window.open(getReportExportUrl("sales-performance", params), "_blank");
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

  if (!data || !data.summary) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <TrendingUp className="h-12 w-12 text-muted-foreground opacity-20" />
        <div className="text-xl font-medium text-muted-foreground">Unable to load sales data</div>
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
        <h2 className="text-3xl font-bold tracking-tight">Sales Performance</h2>
      </div>

      <ReportFilter 
        period={period} 
        setPeriod={setPeriod} 
        onDownload={handleDownload} 
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.summary.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">Order Count</CardTitle>
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.total_orders}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.summary.avg_order_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Daily Revenue Trend</CardTitle>
            <CardDescription>Sales growth for the selected period.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.daily_sales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                />
                <YAxis tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  labelFormatter={(str) => new Date(str).toLocaleDateString(undefined, { dateStyle: 'full' })}
                  formatter={(val: any) => [`$${val.toLocaleString()}`, "Revenue"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>By revenue generated.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.top_products.map((product: any) => (
                <div key={product.sku} className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{product.units_sold} units</p>
                  </div>
                  <div className="text-sm font-bold text-blue-600">
                    ${Number(product.total_revenue).toLocaleString()}
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
