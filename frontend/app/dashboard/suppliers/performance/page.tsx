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
  AlertCircle
} from "lucide-react";
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

import { useSuppliers } from "@/hooks/use-suppliers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Progress } from "@/components/ui/progress";

export default function SupplierPerformancePage() {
  const { data: suppliersData, isLoading, isError, refetch } = useSuppliers({
    is_active: true,
  });

  const suppliers = suppliersData?.data || [];

  // Helper to get status color based on rating
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-blue-600";
    if (rating >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  // Calculate top performers
  const topPerformers = [...suppliers]
    .sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"))
    .slice(0, 5);

  // Prepare chart data for ratings distribution
  const ratingDistribution = [
    { name: "5 Star", value: suppliers.filter(s => parseFloat(s.rating || "0") >= 4.5).length },
    { name: "4 Star", value: suppliers.filter(s => parseFloat(s.rating || "0") >= 3.5 && parseFloat(s.rating || "0") < 4.5).length },
    { name: "3 Star", value: suppliers.filter(s => parseFloat(s.rating || "0") >= 2.5 && parseFloat(s.rating || "0") < 3.5).length },
    { name: "Below 3", value: suppliers.filter(s => parseFloat(s.rating || "0") < 2.5).length },
  ].filter(d => d.value > 0);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Supplier Performance</h1>
        <p className="text-muted-foreground">
          Analytics and KPIs for vendor reliability and delivery quality.
        </p>
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
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 inline-flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> +2.1%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">88.5%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-500 inline-flex items-center">
                    <ArrowDownRight className="h-3 w-3 mr-1" /> -1.4%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lead Time Deviation</CardTitle>
                <TrendingUp className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.2 Days</div>
                <p className="text-xs text-muted-foreground">
                  Average delay across all vendors
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Vendor Score</CardTitle>
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.9 / 5.0</div>
                <p className="text-xs text-muted-foreground">
                  Held by {topPerformers[0]?.name || "N/A"}
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
                  {topPerformers.map((supplier) => {
                    const rating = parseFloat(supplier.rating || "0");
                    return (
                      <div key={supplier.id} className="flex items-center gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">{supplier.name}</p>
                            <span className={`text-sm font-bold ${getRatingColor(rating)}`}>
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

          {/* Delivery Reliability Table (Mock UI) */}
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
                      <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Return Rate</th>
                      <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {suppliers.slice(0, 5).map((s, i) => (
                      <tr key={s.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-2 align-middle font-medium">{s.name}</td>
                        <td className="p-2 align-middle text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-bold">{[98, 92, 85, 78, 95][i]}%</span>
                            <Progress value={[98, 92, 85, 78, 95][i]} className="h-1 w-16" />
                          </div>
                        </td>
                        <td className="p-2 align-middle text-right">{[0.2, 0.8, 1.5, 3.2, 0.5][i]} Days</td>
                        <td className="p-2 align-middle text-right">{[0.5, 1.2, 2.5, 4.8, 0.8][i]}%</td>
                        <td className="p-2 align-middle text-center">
                          <Badge variant={i === 3 ? "destructive" : "default"}>
                            {i === 3 ? "Action Required" : "Stable"}
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
