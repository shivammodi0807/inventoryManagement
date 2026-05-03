"use client";

import React, { useState } from "react";
import { useAuditLogs, getReportExportUrl } from "@/hooks/use-reports";
import { ReportFilter } from "@/components/reports/report-filter";
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
import { ChevronLeft, FileText, History } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format, subDays } from "date-fns";

export default function AuditLogsPage() {
  const [period, setPeriod] = useState("month");
  const [dateRange, setDateRange] = useState({ 
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'), 
    to: format(new Date(), 'yyyy-MM-dd') 
  });

  const { data, isLoading } = useAuditLogs(
    period === "custom" ? dateRange.from : undefined, 
    period === "custom" ? dateRange.to : undefined
  );

  const handleDownload = () => {
    const params: any = {};
    if (period === "custom") {
        params.from = dateRange.from;
        params.to = dateRange.to;
    }
    window.open(getReportExportUrl("audit-logs", params), "_blank");
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  if (!data || !Array.isArray(data)) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <FileText className="h-12 w-12 text-muted-foreground opacity-20" />
        <div className="text-xl font-medium text-muted-foreground">Unable to load audit logs</div>
        <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const getChangeTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'receipt':
      case 'return': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'sale':
      case 'damage': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'adjustment': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/reports"><ChevronLeft className="h-4 w-4" /></Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
      </div>

      <ReportFilter 
        period={period} 
        setPeriod={setPeriod} 
        onDownload={handleDownload} 
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">New Stock</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No activity logs found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">{log.product_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getChangeTypeColor(log.change_type)}>
                        {log.change_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${log.quantity_change > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                      {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                    </TableCell>
                    <TableCell className="text-right font-medium">{log.new_stock}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate" title={log.reason}>
                      {log.reason || "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.user_name}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
