"use client";

import * as React from "react";
import { Plus, Search, ShoppingBag, CheckCircle, Clock, TrendingUp, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import { useSalesOrders, useConfirmSalesOrder, useCancelSalesOrder, useGenerateInvoice } from "@/hooks/use-sales-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SalesOrderTable } from "@/components/sales/sales-order-table";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTablePagination } from "@/components/shared/data-table-pagination";

export default function SalesOrdersPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  const { data: orders, isLoading, isError, refetch } = useSalesOrders({
    search: debouncedSearch,
    page: page,
    per_page: perPage,
  });

  const confirmMutation = useConfirmSalesOrder();
  const cancelMutation = useCancelSalesOrder();
  const generateInvoiceMutation = useGenerateInvoice();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  const pendingCount = orders?.data?.filter((o) => o.status === "pending").length ?? 0;
  const confirmedCount = orders?.data?.filter((o) => o.status === "confirmed").length ?? 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest">Order Management</span>
            <div className="h-1 w-12 bg-primary/20 rounded-full mt-2" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Sales Orders</h1>
          <p className="text-base text-muted-foreground font-medium">
            Streamline your fulfillment workflow and customer relationships.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/sales/orders/create")}
          className="shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold px-6 rounded-xl h-12 gap-2"
        >
          <Plus className="h-5 w-5" /> New Sales Order
        </Button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 flex items-center justify-between group hover:border-primary/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Total Volume</p>
            <h3 className="text-3xl font-semibold tabular-nums">{orders?.total ?? 0}</h3>
            <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded-full w-fit">
              <TrendingUp className="h-3 w-3" />
              <span>+12.5%</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card p-6 flex items-center justify-between group hover:border-amber-500/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Awaiting Confirmation</p>
            <h3 className="text-3xl font-semibold tabular-nums text-amber-600">{pendingCount}</h3>
            <p className="text-[10px] text-muted-foreground font-semibold">Action Required</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500/5 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Confirmed Growth</p>
            <h3 className="text-3xl font-semibold tabular-nums text-blue-600">{confirmedCount}</h3>
            <p className="text-[10px] text-muted-foreground font-semibold">In Pipeline</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-secondary/20 p-2 rounded-2xl border border-border/40">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search order reference, customer, or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 bg-background border-none shadow-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 font-medium placeholder:text-muted-foreground/40"
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-xl border-border/40 font-semibold gap-2 hover:bg-background transition-all shrink-0">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </div>

      {/* Table Section */}
      <div className="relative">
        {isLoading ? (
          <div className="space-y-4">
            <DataTableSkeleton columnCount={6} rowCount={8} />
          </div>
        ) : !orders?.data?.length ? (
          <EmptyState
            title="No orders identified"
            description="Your search criteria didn't match any existing sales orders."
            icon={<ShoppingBag className="h-12 w-12 text-muted-foreground/40" />}
            action={{ label: "Create First Order", onClick: () => router.push("/dashboard/sales/orders/create") }}
            className="min-h-[400px]"
          />
        ) : (
          <>
            <SalesOrderTable
              data={orders.data}
              onConfirm={(id) => confirmMutation.mutate(id)}
              onCancel={(id) => cancelMutation.mutate(id)}
              onGenerateInvoice={(id) => generateInvoiceMutation.mutate(id)}
            />
            <DataTablePagination
              currentPage={page}
              totalPages={orders?.last_page || 1}
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
