"use client";

import { useState } from "react";
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
import { ChevronLeft, FileText, History, Download, Package, User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, subDays } from "date-fns";
import { AuditLogReportItem } from "@/types/reports";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { cn } from "@/lib/utils";

export default function AuditLogsPage() {
  const [period, setPeriod] = useState("month");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });

  const { data, isLoading } = useAuditLogs(
    period === "custom" ? dateRange.from : undefined,
    period === "custom" ? dateRange.to : undefined,
    page,
    perPage
  );

  const handleDownload = () => {
    const params: Record<string, string> = {};
    if (period === "custom") {
      params.from = dateRange.from;
      params.to = dateRange.to;
    }
    window.open(getReportExportUrl("audit-logs", params), "_blank");
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 pb-8">
        <div className="space-y-1 px-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-16 rounded-2xl mx-2" />
        <Skeleton className="h-[600px] rounded-2xl" />
      </div>
    );
  }

  // data is now AuditLogsResponse
  const logs = data?.data || [];

  if (!data || !logs) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <FileText className="h-12 w-12 text-muted-foreground opacity-20" />
        <div className="text-xl font-semibold text-muted-foreground">Unable to synthesize audit data</div>
        <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl font-semibold">Try Again</Button>
      </div>
    );
  }

  const getChangeTypeStyles = (type: string) => {
    switch (type.toLowerCase()) {
      case 'receipt':
      case 'return': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'sale':
      case 'damage': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'adjustment': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Premium Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <ChevronLeft className="h-5 w-5 cursor-pointer hover:text-primary/70" onClick={() => window.history.back()} />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Intelligence Reports</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Operational Ledger</h1>
          <p className="text-base text-muted-medium font-medium">
            Immutable chronological record of all system events and asset movements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 px-4 rounded-xl border-border/40 font-semiboldbold gap-2 hover:bg-background transition-all" onClick={handleDownload}>
            <Download className="size-4" /> Export Ledger
          </Button>
        </div>
      </div>

      <div className="px-2">
        <ReportFilter
          period={period}
          setPeriod={(p) => {
            setPeriod(p);
            setPage(1);
          }}
          onDownload={handleDownload}
          dateRange={dateRange}
          setDateRange={(dr) => {
            setDateRange(dr);
            setPage(1);
          }}
          className="bg-secondary/20 p-2 rounded-2xl border border-border/40"
        />
      </div>

      {/* Main Ledger Table */}
      <Card className="premium-card border-none shadow-premium overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-secondary/10 pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
                <History className="size-5 text-primary" />
                Chain of Custody
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">Comprehensive audit trail of warehouse operations</p>
            </div>
            <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-widest rounded-lg border border-primary/20">
              {data.total} Events Logged
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="py-5 px-6 font-semibold text-[11px] uppercase tracking-widest">Timestamp</TableHead>
                  <TableHead className="font-semibold text-[11px] uppercase tracking-widest">Resource Target</TableHead>
                  <TableHead className="font-semibold text-[11px] uppercase tracking-widest">Event Type</TableHead>
                  <TableHead className="text-right font-semibold text-[11px] uppercase tracking-widest">Delta</TableHead>
                  <TableHead className="text-right font-semibold text-[11px] uppercase tracking-widest">Reconciled</TableHead>
                  <TableHead className="font-semibold text-[11px] uppercase tracking-widest">Personnel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="h-8 w-8 opacity-20" />
                        <p className="font-semibold text-foreground">No Events Recorded</p>
                        <p className="text-xs">No activity logs were found for the specified temporal range.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: AuditLogReportItem) => (
                    <TableRow key={log.id} className="hover:bg-secondary/20 border-border/40 transition-colors group">
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Clock className="size-3 text-muted-foreground/40" />
                          <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">
                            {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-secondary flex items-center justify-center border border-border/40 group-hover:scale-110 transition-transform">
                            <Package className="size-4 text-muted-foreground" />
                          </div>
                          <span className="font-semibold text-foreground tracking-tight">{log.product_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("px-2 py-0.5 rounded-lg font-semibold text-[9px] uppercase tracking-[0.15em] border shadow-none", getChangeTypeStyles(log.change_type))}>
                          {log.change_type}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-semibold tabular-nums",
                        log.quantity_change > 0 ? 'text-emerald-600' : 'text-destructive'
                      )}>
                        {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-foreground">
                        {log.new_stock}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="size-3 text-primary/40" />
                          <span className="text-sm font-semibold text-foreground/80">{log.user_name}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="p-6 border-t border-border/40">
            <DataTablePagination
              currentPage={page}
              totalPages={data?.last_page || 1}
              onPageChange={handlePageChange}
              pageSize={perPage}
              onPageSizeChange={handlePerPageChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
