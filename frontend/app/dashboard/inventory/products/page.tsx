"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Download, Trash2, Package, Truck } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { getProducts, getCategories, deleteProduct } from "@/lib/inventory";
import { ProductsTable } from "@/components/inventory/products-table";
import { StockAdjustModal } from "@/components/inventory/stock-adjust-modal";
import { BulkLinkSupplierModal } from "@/components/inventory/bulk-link-supplier-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Product } from "@/types/inventory";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

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
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("category_id") || "all";
  const stockStatus = searchParams.get("stock_status") || "all";

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", { page, search, categoryId, stockStatus }],
    queryFn: () => getProducts({ 
      page, 
      search, 
      category_id: categoryId === "all" ? undefined : parseInt(categoryId),
      stock_status: stockStatus === "all" ? undefined : stockStatus,
      per_page: 10 
    }),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
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

  // Bulk delete logic
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
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Inventory exported to CSV");
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your inventory and track stock levels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV} disabled={isLoading || !data?.data?.length}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          {can("create", "product") && (
            <Button asChild>
              <Link href="/dashboard/inventory/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-75">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            type="search"
            placeholder="Search SKU or name..."
            className="pl-8"
            defaultValue={search}
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={categoryId} onValueChange={(v) => updateFilters("category_id", v)}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.data?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stockStatus} onValueChange={(v) => updateFilters("stock_status", v)}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedIds.length > 0 && can("edit", "product") && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsBulkLinking(true)}
            >
              <Truck className="mr-2 h-4 w-4" />
              Link to Supplier ({selectedIds.length})
            </Button>
            {can("delete", "product") && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setIsBulkDeleting(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedIds.length})
              </Button>
            )}
          </div>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <DataTableSkeleton columnCount={8} rowCount={10} paged />
          ) : isError ? (
            <ErrorState 
              title="Failed to load products" 
              onRetry={() => refetch()} 
            />
          ) : !data?.data?.length ? (
            <EmptyState
              title={search ? "No products found" : "Your inventory is empty"}
              description={search 
                ? `No products match your search "${search}". Try a different term.`
                : "Start by adding your first product to the catalog."
              }
              icon={<Package className="h-10 w-10 text-muted-foreground" />}
              action={can("create", "product") ? {
                label: "Add Product",
                onClick: () => router.push("/dashboard/inventory/products/new")
              } : undefined}
            />
          ) : (
            <>
              <ProductsTable 
                data={data?.data || []} 
                onAdjustStock={(p) => setAdjustingProduct(p)}
                onDelete={(p) => setDeletingId(p.id)}
                onSelectionChange={setSelectedIds}
              />
              
              {data && data.last_page > 1 && (
                <div className="mt-4 flex items-center justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) handlePageChange(page - 1);
                          }}
                          className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {[...Array(data.last_page)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(i + 1);
                            }}
                            isActive={page === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < data.last_page) handlePageChange(page + 1);
                          }}
                          className={page >= data.last_page ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <StockAdjustModal 
        product={adjustingProduct}
        isOpen={!!adjustingProduct}
        onClose={() => setAdjustingProduct(null)}
      />

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Delete Product"
        description="Are you sure you want to delete this product? This will also remove all its stock information and history. This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={isBulkDeleting}
        onOpenChange={setIsBulkDeleting}
        onConfirm={() => bulkDeleteMutation.mutate(selectedIds)}
        title="Bulk Delete Products"
        description={`Are you sure you want to delete ${selectedIds.length} selected products? This action cannot be undone.`}
        isLoading={bulkDeleteMutation.isPending}
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
