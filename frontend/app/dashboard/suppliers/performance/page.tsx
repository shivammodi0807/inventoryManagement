"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Truck, 
  TrendingUp, 
  Clock, 
  Star, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  PackageCheck,
  AlertCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getReportExportUrl } from "@/hooks/use-reports";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from "recharts";

import { useSupplierPerformance } from "@/hooks/use-reports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Progress } from "@/components/ui/progress";

export default function SupplierPerformancePage() {
  const [isMounted, setIsMounted] = React.useState(false);
  const { data, isLoading, isError, refetch } = useSupplierPerformance();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const suppliers = data?.suppliers || [];
  const topPerformers = data?.top_performers || [];
  const summary = data?.summary || {
    avg_reliability: 0,
    avg_lead_time: 0,
    total_vendors: 0,
    top_vendor: null
  };

  // Prepare chart data for ratings distribution
  const ratingDistribution = [
    { name: "5 Star", value: suppliers.filter((s: any) => parseFloat(s.rating || "0") >= 4.5).length },
    { name: "4 Star", value: suppliers.filter((s: any) => parseFloat(s.rating || "0") >= 3.5 && parseFloat(s.rating || "0") < 4.5).length },
    { name: "3 Star", value: suppliers.filter((s: any) => parseFloat(s.rating || "0") >= 2.5 && parseFloat(s.rating || "0") < 3.5).length },
    { name: "Below 3", value: suppliers.filter((s: any) => parseFloat(s.rating || "0") < 2.5).length },
  ].filter(d => d.value > 0);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Supplier Performance</h1>
            <p className="text-muted-foreground">
                Analytics and KPIs for vendor reliability and delivery quality.
            </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={getReportExportUrl("supplier-performance")} target="_blank">
            <FileText className="h-4 w-4 mr-2" /> Export PDF
          </a>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20" />
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <EmptyState
          title="No data available"
          description="Start adding suppliers and purchase orders to track performance."
          icon={<BarChart3 className="h-10 w-10 text-muted-foreground" />}
        />
      ) : (
        <>
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Reliability</CardTitle>
                <ShieldCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.avg_reliability.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  On-time delivery performance
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Lead Time</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.avg_lead_time.toFixed(1)} Days</div>
                <p className="text-xs text-muted-foreground">
                  From order to reception
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
                <BarChart3 className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_vendors}</div>
                <p className="text-xs text-muted-foreground">
                  Active supplier base
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Vendor Score</CardTitle>
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{parseFloat(summary.top_vendor?.rating || "0").toFixed(1)} / 5.0</div>
                <p className="text-xs text-muted-foreground">
                  Held by {summary.top_vendor?.name || "N/A"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Top Performers List */}
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Top Performing Vendors</CardTitle>
                <CardDescription>Based on quality, delivery time, and pricing.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {topPerformers.map((supplier: any) => {
                    const rating = parseFloat(supplier.rating || "0");
                    return (
                      <div key={supplier.id} className="flex items-center gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">{supplier.name}</p>
                            <span className="text-sm font-bold">
                              {rating.toFixed(1)} ★
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={rating * 20} className="h-2" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Rating Distribution Chart */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Vendor Ratings</CardTitle>
                <CardDescription>Distribution of vendor scores.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center h-[300px]">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ratingDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {ratingDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="h-32 w-32 rounded-full border-4 border-muted animate-pulse" />
                  </div>
                )}
              </CardContent>
              <div className="flex flex-wrap justify-center gap-4 pb-6 px-6">
                {ratingDistribution.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Delivery Reliability Table */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Reliability</CardTitle>
              <CardDescription>Vendors with high on-time delivery rates.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Vendor</th>
                      <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground">On-Time Rate</th>
                      <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Avg. Delay</th>
                      <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Total Spend</th>
                      <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {suppliers.slice(0, 5).map((s: any) => (
                      <tr key={s.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-2 align-middle font-medium">{s.name}</td>
                        <td className="p-2 align-middle text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-bold">{Math.round(s.on_time_rate || 0)}%</span>
                            <Progress value={s.on_time_rate || 0} className="h-1 w-16" />
                          </div>
                        </td>
                        <td className="p-2 align-middle text-right">
                          {s.avg_lead_time ? `${parseFloat(s.avg_lead_time).toFixed(1)} Days` : "N/A"}
                        </td>
                        <td className="p-2 align-middle text-right">
                          ${parseFloat(s.total_spend || 0).toLocaleString()}
                        </td>
                        <td className="p-2 align-middle text-center">
                          <Badge variant="outline">
                            {parseFloat(s.rating || 0).toFixed(1)} ★
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
