"use client";

import * as React from "react";
import { Plus, Warehouse as WarehouseIcon, RefreshCw } from "lucide-react";

import { Warehouse } from "@/types/warehouse";
import { useWarehouses, useDeleteWarehouse, useUpdateWarehouse } from "@/hooks/use-warehouses";
import { WarehouseTable } from "@/components/warehouses/warehouse-table";
import { WarehouseModal } from "@/components/warehouses/warehouse-modal";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusFilter = "all" | "active" | "inactive";

export default function WarehousesPage() {
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
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

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <WarehouseIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Warehouses</h1>
            <p className="text-sm text-muted-foreground">
              Manage your storage locations and their inventory capacity.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button id="add-warehouse-btn" size="sm" onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[160px]" id="warehouse-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Warehouses</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold">{warehouses.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Active</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {warehouses.filter((w) => w.is_active).length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Inactive</p>
          <p className="text-2xl font-bold text-muted-foreground">
            {warehouses.filter((w) => !w.is_active).length}
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 text-muted-foreground">
          <p>Failed to load warehouses.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <WarehouseTable
          data={warehouses}
          onEdit={handleEdit}
          onDelete={setDeletingWarehouse}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* Create / Edit Modal */}
      <WarehouseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={editingWarehouse}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingWarehouse}
        onOpenChange={(open) => !open && setDeletingWarehouse(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete warehouse?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deletingWarehouse?.name}</span>?
              {" "}If this warehouse contains stock, it will be deactivated instead.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
