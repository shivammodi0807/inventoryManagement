"use client";

import * as React from "react";
import { Plus, Search, SlidersHorizontal, Calendar, FileText, ChevronLeft, ChevronRight, Truck } from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { PurchaseOrderStatus } from "@/types/purchase-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { POStatusBadge } from "@/components/purchase-orders/po-status-badge";
import { ErrorState } from "@/components/shared/error-state";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTablePagination } from "@/components/shared/data-table-pagination";

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "all";

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(12);

  const updateStatus = (newStatus: string) => {
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === "all") {
      params.delete("status");
    } else {
      params.set("status", newStatus);
    }
    router.push(`?${params.toString()}`);
  };

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, refetch } = usePurchaseOrders({
    search: debouncedSearch,
    status: status !== "all" ? (status as PurchaseOrderStatus | "pending") : undefined,
    page,
    per_page: perPage,
  });

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const orders = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Truck className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Procurement</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Purchase Orders</h1>
          <p className="text-base text-muted-foreground font-medium">
            Manage incoming stock and supplier relationships with precision.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/purchase-orders/new")}
          className="shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold px-6 rounded-xl h-12 gap-2"
        >
          <Plus className="h-5 w-5" /> Create Purchase Order
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-secondary/20 p-2 rounded-2xl border border-border/40">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search PO number or supplier reference..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-11 h-12 bg-background border-none shadow-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 font-medium placeholder:text-muted-foreground/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={updateStatus}>
            <SelectTrigger className="w-[180px] h-12 bg-background border-none shadow-none rounded-xl font-semibold px-4 focus:ring-2 focus:ring-primary/20">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground/50" />
                <SelectValue placeholder="All Statuses" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 shadow-premium p-1">
              <SelectItem value="all" className="rounded-lg font-semibold">All Statuses</SelectItem>
              <SelectItem value="pending" className="rounded-lg font-semibold text-amber-600">Pending Action</SelectItem>
              <SelectItem value={PurchaseOrderStatus.Draft} className="rounded-lg font-semibold">Draft</SelectItem>
              <SelectItem value={PurchaseOrderStatus.Submitted} className="rounded-lg font-semibold text-blue-600">Submitted</SelectItem>
              <SelectItem value={PurchaseOrderStatus.Confirmed} className="rounded-lg font-semibold text-amber-600">Confirmed</SelectItem>
              <SelectItem value={PurchaseOrderStatus.PartiallyReceived} className="rounded-lg font-semibold text-indigo-600">Partial</SelectItem>
              <SelectItem value={PurchaseOrderStatus.Received} className="rounded-lg font-semibold text-emerald-600">Received</SelectItem>
              <SelectItem value={PurchaseOrderStatus.Cancelled} className="rounded-lg font-semibold text-destructive">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative min-h-[400px]">
        {isLoading ? (
          <DataTableSkeleton columnCount={6} rowCount={8} />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No procurement records found"
            description="Start by creating a new purchase order to manage your incoming inventory."
            icon={<FileText className="h-12 w-12 text-muted-foreground/40" />}
            action={{ label: "Initiate First PO", onClick: () => router.push("/dashboard/purchase-orders/new") }}
            className="min-h-[400px]"
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border-none bg-background shadow-premium overflow-hidden">
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider h-12 text-muted-foreground/70 pl-6">Order Reference</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider h-12 text-muted-foreground/70">Supplier Entity</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider h-12 text-muted-foreground/70">Order Date</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider h-12 text-muted-foreground/70">Exp. Delivery</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider h-12 text-muted-foreground/70">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider h-12 text-muted-foreground/70 text-right pr-6">Investment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="group hover:bg-primary/[0.02] transition-colors border-b border-border/40 last:border-0 cursor-pointer"
                      onClick={() => router.push(`/dashboard/purchase-orders/${order.id}`)}
                    >
                      <TableCell className="py-5 pl-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground tracking-tight">{order.po_number}</span>
                          <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Inbound PO</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-xs font-semibold text-primary border border-primary/10">
                            {order.supplier?.name?.charAt(0) || "S"}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-foreground/90">{order.supplier?.name}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{order.supplier?.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground/80">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-sm font-medium">{format(new Date(order.order_date), "MMM d, yyyy")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-foreground/70">
                          {order.exp_delivery ? format(new Date(order.exp_delivery), "MMM d, yyyy") : "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <POStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-foreground tabular-nums">
                            ${parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground/40 tracking-widest uppercase">Total USD</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DataTablePagination
              currentPage={page}
              totalPages={meta?.last_page || 1}
              onPageChange={setPage}
              pageSize={perPage}
              onPageSizeChange={(size) => {
                setPerPage(size);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
