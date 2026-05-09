"use client";

import * as React from "react";
import { Plus, Warehouse as WarehouseIcon, RefreshCw, CheckCircle2, XCircle, SlidersHorizontal, MapPin, Search } from "lucide-react";

import { Warehouse } from "@/types/warehouse";
import { useWarehouses, useDeleteWarehouse, useUpdateWarehouse } from "@/hooks/use-warehouses";
import { WarehouseTable } from "@/components/warehouses/warehouse-table";
import { WarehouseModal } from "@/components/warehouses/warehouse-modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "active" | "inactive";

export default function WarehousesPage() {
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingWarehouse, setEditingWarehouse] = React.useState<Warehouse | null>(null);
  const [deletingWarehouse, setDeletingWarehouse] = React.useState<Warehouse | null>(null);

  // Derive isActive param from the filter
  const isActiveParam =
    statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined;

  const { data: warehouses = [], isLoading, isError, refetch } = useWarehouses(isActiveParam);
  const deleteMutation = useDeleteWarehouse();
  const updateMutation = useUpdateWarehouse();

  const handleAddNew = () => {
    setEditingWarehouse(null);
    setModalOpen(true);
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setModalOpen(true);
  };

  const handleToggleActive = (warehouse: Warehouse) => {
    updateMutation.mutate({
      id: warehouse.id,
      data: { is_active: !warehouse.is_active },
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingWarehouse) return;
    deleteMutation.mutate(deletingWarehouse.id, {
      onSettled: () => setDeletingWarehouse(null),
    });
  };

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <MapPin className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Logistics Hub</span>
            <div className="h-1 w-12 bg-primary/20 rounded-full mt-2" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Warehouses</h1>
          <p className="text-base text-muted-foreground font-medium">
            Manage your storage locations and inventory distribution nodes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="h-12 px-5 rounded-xl border-border/40 font-semibold gap-2 hover:bg-background transition-all shrink-0"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} /> Refresh
          </Button>
          <Button 
            onClick={handleAddNew}
            className="shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold px-6 rounded-xl h-12 gap-2"
          >
            <Plus className="h-5 w-5" /> Add Warehouse
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 flex items-center justify-between group hover:border-primary/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Total Locations</p>
            <h3 className="text-3xl font-semibold tabular-nums">{warehouses.length}</h3>
            <p className="text-[10px] text-muted-foreground font-semibold">In Operation</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <WarehouseIcon className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card p-6 flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Active Capacity</p>
            <h3 className="text-3xl font-semibold tabular-nums text-emerald-600">
              {warehouses.filter((w) => w.is_active).length}
            </h3>
            <p className="text-[10px] text-muted-foreground font-semibold">Ready for Stock</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card p-6 flex items-center justify-between group hover:border-muted-foreground/30 transition-all cursor-default text-muted-foreground">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">Inactive Nodes</p>
            <h3 className="text-3xl font-semibold tabular-nums">
              {warehouses.filter((w) => !w.is_active).length}
            </h3>
            <p className="text-[10px] text-muted-foreground/40 font-semibold">Offline</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-muted/5 flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
            <XCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-secondary/20 p-2 rounded-2xl border border-border/40">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by facility name or location node..."
            className="w-full pl-11 pr-4 h-12 bg-background border-none shadow-none rounded-xl focus:ring-2 focus:ring-primary/20 font-medium placeholder:text-muted-foreground/40 outline-none transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-full md:w-60 h-12 bg-background border-none shadow-none rounded-xl font-semibold px-4 focus:ring-2 focus:ring-primary/20">
            <div className="flex items-center gap-2 text-foreground">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground/50" />
              <SelectValue placeholder="All Warehouses" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/40 shadow-premium p-1">
            <SelectItem value="all" className="rounded-lg font-semibold">All Locations</SelectItem>
            <SelectItem value="active" className="rounded-lg font-semibold text-emerald-600">Active Hubs</SelectItem>
            <SelectItem value="inactive" className="rounded-lg font-semibold text-muted-foreground">Offline Hubs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Section */}
      <div className="relative">
        {isLoading ? (
          <DataTableSkeleton columnCount={5} rowCount={6} />
        ) : warehouses.length === 0 ? (
          <EmptyState
            title="No warehouses identified"
            description="Start by adding your first storage location to track inventory."
            icon={<WarehouseIcon className="h-12 w-12 text-muted-foreground/40" />}
            action={{ label: "Register New Warehouse", onClick: handleAddNew }}
            className="min-h-100"
          />
        ) : (
          <WarehouseTable
            data={warehouses}
            onEdit={handleEdit}
            onDelete={setDeletingWarehouse}
            onToggleActive={handleToggleActive}
            searchQuery={searchQuery}
          />
        )}
      </div>

      <WarehouseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={editingWarehouse}
      />

      <ConfirmDialog
        open={!!deletingWarehouse}
        onOpenChange={(open) => !open && setDeletingWarehouse(null)}
        title="Delete Warehouse?"
        description={`Are you sure you want to delete ${deletingWarehouse?.name}? If this warehouse contains stock, it will be deactivated instead. This action cannot be undone.`}
        confirmText="Confirm Deletion"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
