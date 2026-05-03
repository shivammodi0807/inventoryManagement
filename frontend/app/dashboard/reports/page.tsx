"use client";

import React from "react";
import { 
  BarChart3, 
  Package2, 
  TrendingUp, 
  AlertCircle, 
  ArrowRight,
  FileText
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const reportCards = [
    {
      title: "Inventory Valuation",
      description: "Breakdown of current stock value by category and warehouse. Essential for asset tracking.",
      icon: <Package2 className="h-8 w-8 text-emerald-500" />,
      href: "/dashboard/reports/inventory",
      color: "border-emerald-100 bg-emerald-50/30",
    },
    {
      title: "Sales Performance",
      description: "Analyze revenue trends, top products, and order volumes over different periods.",
      icon: <TrendingUp className="h-8 w-8 text-blue-500" />,
      href: "/dashboard/reports/sales",
      color: "border-blue-100 bg-blue-50/30",
    },
    {
      title: "Low Stock Analysis",
      description: "Detailed view of items needing replenishment with preferred supplier information.",
      icon: <AlertCircle className="h-8 w-8 text-amber-500" />,
      href: "/dashboard/reports/low-stock",
      color: "border-amber-100 bg-amber-50/30",
    },
    {
      title: "Audit Logs",
      description: "History of all inventory adjustments, receipts, and sales for compliance tracking.",
      icon: <FileText className="h-8 w-8 text-slate-500" />,
      href: "/dashboard/reports/audit",
      color: "border-slate-100 bg-slate-50/30",
    },
    {
      title: "Supplier Performance",
      description: "Track vendor reliability, lead times, and quality ratings for strategic sourcing.",
      icon: <BarChart3 className="h-8 w-8 text-indigo-500" />,
      href: "/dashboard/suppliers/performance",
      color: "border-indigo-100 bg-indigo-50/30",
    },
    {
      title: "Inventory Forecasting",
      description: "Predictive stock runway analysis. Know exactly when you will run out of stock.",
      icon: <TrendingUp className="h-8 w-8 text-violet-500" />,
      href: "/dashboard/reports/forecast",
      color: "border-violet-100 bg-violet-50/30",
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reporting & Analytics</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mt-8">
        {reportCards.map((report) => (
          <Card key={report.title} className={`hover:shadow-md transition-all border-2 ${report.color}`}>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="mr-4 rounded-lg bg-white p-2 shadow-sm">
                {report.icon}
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold">{report.title}</CardTitle>
                <CardDescription className="text-slate-600 mt-1">
                  {report.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Button asChild variant="ghost" className="p-0 text-primary hover:bg-transparent">
                <Link href={report.href} className="flex items-center">
                  View Report <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
