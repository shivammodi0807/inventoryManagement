"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Ruler, MoreHorizontal, Pencil, Trash2, Package, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { getUnits, deleteUnit } from "@/lib/inventory";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { UnitModal } from "@/components/inventory/unit-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Unit } from "@/types/inventory";

export default function UnitsPage() {
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    data: units,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["units"],
    queryFn: () => getUnits(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      toast.success("Unit deleted");
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setDeletingId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete unit");
      setDeletingId(null);
    },
  });

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const totalUnits = units?.data?.length || 0;
  const unitsWithType = units?.data?.filter(u => u.type).length || 0;
  const totalProductsLinked = units?.data?.reduce((acc, curr) => acc + (curr.products_count || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Units of Measure
          </h1>
          <p className="text-muted-foreground">
            Define how your products are quantified (e.g. pieces, kg, boxes).
          </p>
        </div>
        {can("create", "unit") && (
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              Active measurement units
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorized</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unitsWithType}</div>
            <p className="text-xs text-muted-foreground">
              Units with defined type
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductsLinked}</div>
            <p className="text-xs text-muted-foreground">
              Total products linked
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unit List</CardTitle>
          <CardDescription>
            System-wide units available for product definitions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columnCount={4} rowCount={5} />
          ) : isError ? (
            <ErrorState
              title="Failed to load units"
              onRetry={() => refetch()}
            />
          ) : !units?.data?.length ? (
            <EmptyState
              title="No units found"
              description="Define measurement units to quantify your products."
              icon={<Ruler className="h-10 w-10 text-muted-foreground" />}
              action={
                can("create", "unit")
                  ? {
                      label: "Add Unit",
                      onClick: handleAdd,
                    }
                  : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Abbreviation</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Linked Products</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.data.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        {unit.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold">
                        {unit.abbreviation}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize text-muted-foreground">
                        {unit.type || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {unit.products_count || 0} products
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(unit.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {can("edit", "unit") && (
                            <DropdownMenuItem onClick={() => handleEdit(unit)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {can("delete", "unit") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeletingId(unit.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <UnitModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={editingUnit}
      />

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Delete Unit"
        description="Are you sure you want to delete this unit of measure? This action cannot be undone and may affect products linked to it."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
