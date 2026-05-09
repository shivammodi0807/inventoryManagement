"use client";

import React from "react";
import {
  BarChart3,
  Package2,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  FileText,
  PieChart,
  Activity,
  Zap
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const reportCards = [
    {
      title: "Inventory Valuation",
      description: "Monetary breakdown of current stock assets by taxonomy and logistics node.",
      icon: <Package2 className="h-6 w-6" />,
      href: "/dashboard/reports/inventory",
      color: "emerald",
      tag: "Asset Analysis"
    },
    {
      title: "Sales Performance",
      description: "Revenue trajectory, top-performing SKUs, and order fulfillment metrics.",
      icon: <TrendingUp className="h-6 w-6" />,
      href: "/dashboard/reports/sales",
      color: "blue",
      tag: "Revenue IQ"
    },
    {
      title: "Low Stock Matrix",
      description: "Strategic identifying of items below safety threshold requiring immediate restock.",
      icon: <AlertCircle className="h-6 w-6" />,
      href: "/dashboard/reports/low-stock",
      color: "amber",
      tag: "Supply Risk"
    },
    {
      title: "Operational Audit",
      description: "Chronological ledger of system events, adjustments, and chain of custody.",
      icon: <FileText className="h-6 w-6" />,
      href: "/dashboard/reports/audit",
      color: "slate",
      tag: "Compliance"
    },
    {
      title: "Supplier Performance",
      description: "Vendor reliability scoring, lead-time variance, and sourcing strategic analysis.",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/dashboard/suppliers/performance",
      color: "indigo",
      tag: "Partner Index"
    },
    {
      title: "Inventory Forecast",
      description: "Predictive runway analysis and demand projections for future procurement.",
      icon: <Zap className="h-6 w-6" />,
      href: "/dashboard/reports/forecast",
      color: "violet",
      tag: "Predictive"
    },
  ];

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 group-hover:bg-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20 group-hover:bg-blue-500/20",
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/20 group-hover:bg-amber-500/20",
    slate: "bg-slate-500/10 text-slate-600 border-slate-500/20 group-hover:bg-slate-500/20",
    indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 group-hover:bg-indigo-500/20",
    violet: "bg-violet-500/10 text-violet-600 border-violet-500/20 group-hover:bg-violet-500/20",
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Premium Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <PieChart className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Intelligence Hub</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Reporting & Analytics</h1>
          <p className="text-base text-muted-foreground font-medium">
            Strategic insight engines for data-driven supply chain management.
          </p>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {reportCards.map((report) => (
          <Link key={report.title} href={report.href} className="group">
            <Card className="premium-card border-none shadow-premium h-full group-hover:scale-[1.01] transition-all duration-300 relative overflow-hidden bg-background">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                {React.cloneElement(report.icon as React.ReactElement<{ className?: string }>, { className: "size-24" })}
              </div>
              <CardHeader className="flex flex-row items-start gap-4 pb-4">
                <div className={cn(
                  "p-3 rounded-2xl border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                  colorMap[report.color]
                )}>
                  {report.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-semibold text-[9px] uppercase tracking-widest border-none bg-secondary/50 text-muted-foreground/60">
                      {report.tag}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {report.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {report.description}
                </CardDescription>
                <div className="flex items-center text-[11px] font-semibold uppercase tracking-[0.2em] text-primary pt-2">
                  Launch Analytical Engine <ArrowRight className="ml-2 size-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Footer Insight */}
      <div className="flex items-center justify-center py-6 px-4 bg-secondary/20 rounded-2xl border border-border/40 mx-2">
        <div className="flex items-center gap-3 text-muted-foreground/60">
          <Activity className="size-4" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">System Intelligence Layer V3.01 — Operational</p>
        </div>
      </div>
    </div>
  );
}
