"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Download, Trash2, Package, Truck, Sparkles, SlidersHorizontal, ChevronLeft, ChevronRight, AlertTriangle, Boxes, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { getProducts, getCategories, deleteProduct, getProductStats } from "@/lib/inventory";
import { ProductsTable } from "@/components/inventory/products-table";
import { StockAdjustModal } from "@/components/inventory/stock-adjust-modal";
import { BulkLinkSupplierModal } from "@/components/inventory/bulk-link-supplier-modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Product } from "@/types/inventory";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { can } = useAuth();

  const [adjustingProduct, setAdjustingProduct] = React.useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false);
  const [isBulkLinking, setIsBulkLinking] = React.useState(false);

  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("per_page") || "10");
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("category_id") || "all";
  const stockStatus = searchParams.get("stock_status") || "all";

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", { page, perPage, search, categoryId, stockStatus }],
    queryFn: () => getProducts({
      page,
      search,
      category_id: categoryId === "all" ? undefined : parseInt(categoryId),
      stock_status: stockStatus === "all" ? undefined : stockStatus,
      per_page: perPage
    }),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const { data: stats } = useQuery({
    queryKey: ["products-stats"],
    queryFn: () => getProductStats(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeletingId(null);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || "Failed to delete product");
      setDeletingId(null);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      for (const id of ids) {
        await deleteProduct(id);
      }
    },
    onSuccess: () => {
      toast.success(`${selectedIds.length} products deleted`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelectedIds([]);
      setIsBulkDeleting(false);
    },
    onError: () => {
      toast.error("Failed to delete some products");
      setIsBulkDeleting(false);
    }
  });

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/dashboard/inventory/products?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateFilters("search", formData.get("search") as string);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/dashboard/inventory/products?${params.toString()}`);
    
  };

  const handlePerPageChange = (newPerPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("per_page", newPerPage.toString());
    params.set("page", "1");
    router.push(`/dashboard/inventory/products?${params.toString()}`);
  };

  const handleExportCSV = () => {
    if (!data?.data?.length) return;
    const headers = ["SKU", "Name", "Category", "Price", "Cost", "Stock", "Status"];
    const rows = data.data.map(p => [
      p.sku,
      p.name,
      p.category?.name || "Uncategorized",
      p.unit_price,
      p.cost_price,
      p.total_stock,
      p.stock_status
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    toast.success("Inventory exported to CSV");
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Premium Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Boxes className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Asset Intelligence</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Global Inventory</h1>
          <p className="text-base text-muted-foreground font-medium">
            Strategic tracking and management of your entire product catalog.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={isLoading || !data?.data?.length}
            className="h-11 px-5 rounded-xl border-border/40 font-semibold text-[10px] uppercase tracking-widest gap-2 hover:bg-secondary/40 transition-all shrink-0"
          >
            <Download className="h-4 w-4" /> Export Ledger
          </Button>
          {can("create", "product") && (
            <Button
              asChild
              className="shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold px-6 rounded-xl h-11 text-[11px] uppercase tracking-widest gap-2"
            >
              <Link href="/dashboard/inventory/products/new">
                <Plus className="h-5 w-5" /> Add New Asset
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="premium-card p-6 flex items-center justify-between group hover:border-primary/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Total SKU Registry</p>
            <h3 className="text-3xl font-semibold tabular-nums">{stats?.total ?? 0}</h3>
            <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md w-fit uppercase tracking-tighter">
              <BarChart3 className="h-3 w-3" />
              <span>Full Spectrum</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-primary/10">
            <Package className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card p-6 flex items-center justify-between group hover:border-amber-500/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Low Stock Signals</p>
            <h3 className="text-3xl font-semibold tabular-nums text-amber-600">
              {(stats?.low ?? 0) + (stats?.critical ?? 0)}
            </h3>
            <p className="text-[10px] text-muted-foreground font-semibold italic uppercase tracking-tighter">Requires Reorder</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500/5 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform border border-amber-500/10">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card p-6 flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Healthy Inventory</p>
            <h3 className="text-3xl font-semibold tabular-nums text-emerald-600">
              {stats?.normal ?? 0}
            </h3>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tighter">Optimal Parity</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform border border-emerald-500/10">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card p-6 flex items-center justify-between group hover:border-rose-500/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Out of Stock</p>
            <h3 className="text-3xl font-semibold tabular-nums text-rose-600">
              {stats?.critical ?? 0}
            </h3>
            <p className="text-[10px] text-rose-500 font-semibold uppercase tracking-tighter animate-pulse">Critical Shortage</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-rose-500/5 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform border border-rose-500/10">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-secondary/20 p-2 rounded-2xl border border-border/40">
        <form onSubmit={handleSearch} className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <input
            name="search"
            type="search"
            placeholder="Search by SKU, product name, or attributes..."
            className="w-full pl-11 pr-4 h-12 bg-background border-none shadow-none rounded-xl focus:ring-2 focus:ring-primary/20 font-medium placeholder:text-muted-foreground/40 outline-none transition-all text-sm"
            defaultValue={search}
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={categoryId} onValueChange={(v) => updateFilters("category_id", v)}>
            <SelectTrigger className="w-full md:w-[180px] h-12 bg-background border-none shadow-none rounded-xl font-semibold px-4 focus:ring-2 focus:ring-primary/20 text-xs uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground/50" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 shadow-premium p-1">
              <SelectItem value="all" className="rounded-lg font-semibold text-[10px] uppercase tracking-widest">All Categories</SelectItem>
              {categories?.data?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-lg font-semibold text-[10px] uppercase tracking-widest">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stockStatus} onValueChange={(v) => updateFilters("stock_status", v)}>
            <SelectTrigger className="w-full md:w-[160px] h-12 bg-background border-none shadow-none rounded-xl font-semibold px-4 focus:ring-2 focus:ring-primary/20 text-xs uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground/50" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 shadow-premium p-1">
              <SelectItem value="all" className="rounded-lg font-semibold text-[10px] uppercase tracking-widest">All Statuses</SelectItem>
              <SelectItem value="normal" className="rounded-lg font-semibold text-[10px] uppercase tracking-widest text-emerald-600">Healthy</SelectItem>
              <SelectItem value="low" className="rounded-lg font-semibold text-[10px] uppercase tracking-widest text-amber-600">Low Stock</SelectItem>
              <SelectItem value="critical" className="rounded-lg font-semibold text-[10px] uppercase tracking-widest text-rose-600">Critical</SelectItem>
              <SelectItem value="out" className="rounded-lg font-semibold text-[10px] uppercase tracking-widest text-rose-700">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && can("edit", "product") && (
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-xl border border-primary/10 animate-in fade-in slide-in-from-left-2 duration-300 mx-2">
          <Badge className="bg-primary text-primary-foreground border-none font-semibold text-[10px] uppercase tracking-widest px-2.5 h-6">
            {selectedIds.length} Assets Selected
          </Badge>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBulkLinking(true)}
              className="h-8 rounded-lg font-semibold text-[10px] uppercase tracking-widest gap-2 hover:bg-primary/10 text-primary transition-all"
            >
              <Truck className="h-3.5 w-3.5" /> Bulk Link Supplier
            </Button>
            {can("delete", "product") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBulkDeleting(true)}
                className="h-8 rounded-lg font-semibold text-[10px] uppercase tracking-widest gap-2 hover:bg-rose-500/10 text-rose-600 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" /> Batch Decommission
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Data Section */}
      <div className="relative">
        {isLoading ? (
          <DataTableSkeleton columnCount={8} rowCount={10} paged />
        ) : isError ? (
          <div className="flex h-[400px] items-center justify-center">
            <ErrorState title="Failed to load assets" onRetry={() => refetch()} />
          </div>
        ) : !data?.data?.length ? (
          <div className="py-20">
            <EmptyState
              title={search ? "Zero Intelligence Matches" : "Registry Empty"}
              description={search 
                ? `No assets found in the registry matching "${search}".`
                : "The system asset catalogue is currently devoid of entries. Initiate registration to begin."
              }
              icon={<Package className="size-12 text-muted-foreground/30" />}
              action={can("create", "product") ? {
                label: "Initiate Registration",
                onClick: () => router.push("/dashboard/inventory/products/new")
              } : undefined}
            />
          </div>
        ) : (
          <>
            <ProductsTable 
              data={data?.data || []} 
              onAdjustStock={(p) => setAdjustingProduct(p)}
              onDelete={(p) => setDeletingId(p.id)}
              onSelectionChange={setSelectedIds}
            />
            
            <div className="mt-6 border-t border-border/40 pt-6">
              <DataTablePagination
                currentPage={page}
                totalPages={data?.last_page || 1}
                onPageChange={handlePageChange}
                pageSize={perPage}
                onPageSizeChange={handlePerPageChange}
              />
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <StockAdjustModal 
        product={adjustingProduct}
        isOpen={!!adjustingProduct}
        onClose={() => setAdjustingProduct(null)}
      />

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Asset Decommission"
        description="Are you sure you want to decommission this asset? This will permanently delete the entry and all associated operational logs from the system registry."
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />

      <ConfirmDialog
        open={isBulkDeleting}
        onOpenChange={setIsBulkDeleting}
        onConfirm={() => bulkDeleteMutation.mutate(selectedIds)}
        title="Batch Decommission"
        description={`You are about to decommission ${selectedIds.length} assets. This procedure is permanent and will delete all selected entries from the system registry.`}
        isLoading={bulkDeleteMutation.isPending}
        variant="destructive"
      />

      <BulkLinkSupplierModal
        productIds={selectedIds}
        open={isBulkLinking}
        onOpenChange={setIsBulkLinking}
        onSuccess={() => {
          setSelectedIds([]);
          refetch();
        }}
      />
    </div>
  );
}
