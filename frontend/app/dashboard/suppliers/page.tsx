"use client";

import * as React from "react";
import { Plus, Search, Truck, Users, Star, SlidersHorizontal, Building2 } from "lucide-react";

import { useSuppliers, useDeleteSupplier } from "@/hooks/use-suppliers";
import { Supplier } from "@/types/supplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SupplierTable } from "@/components/suppliers/supplier-table";
import { SupplierModal } from "@/components/suppliers/supplier-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTablePagination } from "@/components/shared/data-table-pagination";

export default function SuppliersPage() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedSupplier, setSelectedSupplier] = React.useState<Supplier | null>(null);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const { data: suppliers, isLoading, isError, refetch } = useSuppliers({
    search: debouncedSearch,
    page,
    per_page: perPage,
  });

  const deleteMutation = useDeleteSupplier();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAdd = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDelete = (supplier: Supplier) => {
    setDeleteId(supplier.id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Building2 className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Partner Network</span>
            <div className="h-1 w-12 bg-primary/20 rounded-full mt-2" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Suppliers</h1>
          <p className="text-base text-muted-foreground font-medium">
            Manage your supply chain and vendor relationships in one place.
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold px-6 rounded-xl h-12 gap-2"
        >
          <Plus className="h-5 w-5" /> Add New Supplier
        </Button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 flex items-center justify-between group hover:border-primary/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Registered Vendors</p>
            <h3 className="text-3xl font-semibold tabular-nums">{suppliers?.total ?? 0}</h3>
            <p className="text-[10px] text-muted-foreground font-semibold">Active Partnerships</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Active Logistics</p>
            <h3 className="text-3xl font-semibold tabular-nums text-blue-600">{suppliers?.total ?? 0}</h3>
            <p className="text-[10px] text-muted-foreground font-semibold">Ready to Order</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <Truck className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card p-6 flex items-center justify-between group hover:border-amber-500/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Performance Index</p>
            <h3 className="text-3xl font-semibold tabular-nums text-amber-600">4.9</h3>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500/5 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <Star className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-secondary/20 p-2 rounded-2xl border border-border/40">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by company name, contact, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 bg-background border-none shadow-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 font-medium placeholder:text-muted-foreground/40"
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-xl border-border/40 font-semiboldbold gap-2 hover:bg-background transition-all shrink-0">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </div>

      {/* Table Section */}
      <div className="relative">
        {isLoading ? (
          <DataTableSkeleton columnCount={5} rowCount={8} />
        ) : !suppliers?.data?.length ? (
          <EmptyState
            title="No suppliers identified"
            description="Your partner network is currently empty or no matches were found."
            icon={<Truck className="h-12 w-12 text-muted-foreground/40" />}
            action={{ label: "Add Your First Supplier", onClick: handleAdd }}
            className="min-h-[400px]"
          />
        ) : (
          <>
            <SupplierTable
              data={suppliers.data}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <div className="mt-6 border-t border-border/40 pt-6">
              <DataTablePagination
                currentPage={page}
                totalPages={suppliers?.last_page || 1}
                onPageChange={(p) => {
                  setPage(p);
                  
                }}
                pageSize={perPage}
                onPageSizeChange={(size) => {
                  setPerPage(size);
                  setPage(1);
                }}
              />
            </div>
          </>
        )}
      </div>

      <SupplierModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={selectedSupplier}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Deactivate Supplier"
        description="Are you sure you want to deactivate this supplier? They will no longer appear in new purchase orders."
        confirmText="Deactivate"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
