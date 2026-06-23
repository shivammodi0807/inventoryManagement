"use client";

import React from "react";
import { Search, FileText, TrendingUp, Clock, AlertCircle, Filter } from "lucide-react";
import { useInvoices, useInvoiceStats } from "@/hooks/use-sales-orders";
import { InvoiceTable } from "@/components/sales/invoice-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/shared/data-table-pagination";

export default function InvoicesPage() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  const { data, isLoading } = useInvoices({
    search: debouncedSearch,
    status: status === "all" ? undefined : status,
    page: page,
    per_page: perPage,
  });

  const { data: stats } = useInvoiceStats();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const invoices = data?.data || [];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Premium Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Financial Ledger</span>
            <div className="h-1 w-12 bg-primary/20 rounded-full mt-2" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Invoices</h1>
          <p className="text-base text-muted-foreground font-medium">
            Monitor receivables, payment statuses, and revenue collection.
          </p>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 flex items-center justify-between group hover:border-primary/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Total Issued</p>
            <h3 className="text-3xl font-semibold tabular-nums">{stats?.total ?? 0}</h3>
            <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded-full w-fit">
              <TrendingUp className="h-3 w-3" />
              <span>Revenue Tracking</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-primary/10">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card p-6 flex items-center justify-between group hover:border-amber-500/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Pending Collection</p>
            <h3 className="text-3xl font-semibold tabular-nums text-amber-600">{stats?.unpaid ?? 0}</h3>
            <p className="text-[10px] text-muted-foreground font-semibold italic">Awaiting Settlement</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500/5 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform border border-amber-500/10">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card p-6 flex items-center justify-between group hover:border-rose-500/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Risk Threshold</p>
            <h3 className="text-3xl font-semibold tabular-nums text-rose-600">{stats?.overdue ?? 0}</h3>
            <p className="text-[10px] text-rose-500/70 font-semibold uppercase tracking-tighter animate-pulse">Critical Overdue</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-rose-500/5 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform border border-rose-500/10">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-secondary/20 p-2 rounded-2xl border border-border/40">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search invoice number or order reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 bg-background border-none shadow-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 font-medium placeholder:text-muted-foreground/40"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
            <SelectTrigger className="h-12 w-full md:w-48 bg-background border-none rounded-xl font-semibold text-xs uppercase tracking-widest px-4 focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              <SelectItem value="all" className="text-xs font-semibold uppercase tracking-widest">All Statuses</SelectItem>
              <SelectItem value="unpaid" className="text-xs font-semibold uppercase tracking-widest text-amber-600">Unpaid</SelectItem>
              <SelectItem value="partial" className="text-xs font-semibold uppercase tracking-widest text-blue-600">Partial</SelectItem>
              <SelectItem value="paid" className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Paid</SelectItem>
              <SelectItem value="overdue" className="text-xs font-semibold uppercase tracking-widest text-rose-600">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-12 px-6 rounded-xl border-none bg-background font-semibold text-[10px] uppercase tracking-[0.2em] gap-2 hover:bg-secondary/40 transition-all shrink-0">
            <Filter className="h-3 w-3" /> Advanced
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="relative">
        {isLoading ? (
          <div className="space-y-4">
            <DataTableSkeleton columnCount={7} rowCount={10} />
          </div>
        ) : (
          <>
            <InvoiceTable data={invoices} />
            <DataTablePagination
              currentPage={page}
              totalPages={data?.last_page || 1}
              onPageChange={handlePageChange}
              pageSize={perPage}
              onPageSizeChange={handlePerPageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
