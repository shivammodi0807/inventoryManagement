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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
import { DataTablePagination } from "@/components/shared/data-table-pagination";

export default function UnitsPage() {
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const {
    data: units,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["units", page, perPage],
    queryFn: () => getUnits({ page, per_page: perPage }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      toast.success("Unit deleted");
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setDeletingId(null);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  const totalUnits = units?.total || 0;
  const unitsWithType = units?.data?.filter(u => u.type).length || 0;
  const totalProductsLinked = units?.data?.reduce((acc, curr) => acc + (curr.products_count || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Dynamic Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Ruler className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Metrology Settings</span>
            <div className="h-1 w-12 bg-primary/20 rounded-full mt-2" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Units of Measure</h1>
          <p className="text-base text-muted-foreground font-medium">
            Standardize how your assets are quantified across the global supply chain.
          </p>
        </div>
        {can("create", "unit") && (
          <Button onClick={handleAdd} className="h-11 px-6 rounded-xl font-semibold gap-2 shadow-premium hover:scale-[1.02] transition-all">
            <Plus className="size-5" /> Define Unit
          </Button>
        )}
      </div>

      {/* Metrology KPI Strip */}
      <div className="grid gap-6 md:grid-cols-3">
        <UnitKPICard
          title="Metric Registry"
          value={totalUnits}
          subtitle="Total measurement schemas"
          icon={<Ruler className="size-5" />}
          color="indigo"
        />
        <UnitKPICard
          title="Type Coverage"
          value={unitsWithType}
          subtitle="Units with defined taxonomy"
          icon={<Tag className="size-5" />}
          color="blue"
        />
        <UnitKPICard
          title="Operational Usage"
          value={totalProductsLinked}
          subtitle="Active product linkings"
          icon={<Package className="size-5" />}
          color="purple"
        />
      </div>

      <Card className="premium-card border-none shadow-premium overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-secondary/10 pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight">Standardization Ledger</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">Global units of measure available for asset quantification</p>
            </div>
            <Badge className="font-semibold bg-primary/10 text-primary border-none text-[10px] uppercase tracking-widest px-3">
              Standardized Core
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <DataTableSkeleton columnCount={5} rowCount={8} />
            </div>
          ) : isError ? (
            <div className="p-12">
              <ErrorState title="Failed to load metrology data" onRetry={() => refetch()} />
            </div>
          ) : !units?.data?.length ? (
            <div className="p-20">
              <EmptyState
                title="No Units Defined"
                description="Your metrology registry is currently empty. Establish standard units to begin quantifying inventory."
                icon={<Ruler className="size-12 text-muted-foreground/30" />}
                action={can("create", "unit") ? {
                  label: "Define Unit",
                  onClick: handleAdd,
                } : undefined}
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-secondary/20">
                    <TableRow className="hover:bg-transparent border-border/40">
                      <TableHead className="py-5 px-6 font-semibold text-[11px] uppercase tracking-widest">Unit Specification</TableHead>
                      <TableHead className="py-5 font-semibold text-[11px] uppercase tracking-widest">Abbreviation</TableHead>
                      <TableHead className="py-5 font-semibold text-[11px] uppercase tracking-widest">Metrology Type</TableHead>
                      <TableHead className="py-5 text-center font-semibold text-[11px] uppercase tracking-widest">Asset Linkage</TableHead>
                      <TableHead className="py-5 font-semibold text-[11px] uppercase tracking-widest">Established</TableHead>
                      <TableHead className="py-5 w-25"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {units.data.map((unit) => (
                      <TableRow key={unit.id} className="hover:bg-secondary/20 border-border/40 transition-colors group">
                        <TableCell className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-transform">
                              <Ruler className="size-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground tracking-tight">{unit.name}</p>
                              <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">ID: UOM-{unit.id.toString().padStart(4, '0')}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <code className="rounded-lg bg-secondary border border-border/40 px-2.5 py-1 font-semibold text-[11px] text-foreground tracking-widest">
                            {unit.abbreviation}
                          </code>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex items-center gap-2">
                            <div className="size-1.5 rounded-full bg-primary/40" />
                            <span className="text-sm font-semibold text-muted-foreground capitalize">
                              {unit.type || "Undefined"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 border border-primary/10 rounded-lg">
                            <span className="text-sm font-semibold text-primary tabular-nums">{unit.products_count || 0}</span>
                            <span className="text-[10px] font-semibold text-primary/60 uppercase tracking-widest">Products</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">
                            {new Date(unit.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </TableCell>
                        <TableCell className="py-5 text-right px-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-primary/5 hover:text-primary">
                                <MoreHorizontal className="size-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/40 shadow-premium p-1.5">
                              <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 py-2">Lifecycle Actions</DropdownMenuLabel>
                              {can("edit", "unit") && (
                                <DropdownMenuItem onClick={() => handleEdit(unit)} className="rounded-lg font-semibold gap-2 py-2.5">
                                  <Pencil className="size-4" /> Edit Definition
                                </DropdownMenuItem>
                              )}
                              {can("delete", "unit") && (
                                <>
                                  <DropdownMenuSeparator className="bg-border/40" />
                                  <DropdownMenuItem
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg font-semibold gap-2 py-2.5"
                                    onClick={() => setDeletingId(unit.id)}
                                  >
                                    <Trash2 className="size-4" /> Decommission Unit
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
              </div>
              <div className="p-6 border-t border-border/40">
                <DataTablePagination
                  currentPage={page}
                  totalPages={units?.last_page || 1}
                  onPageChange={handlePageChange}
                  pageSize={perPage}
                  onPageSizeChange={handlePerPageChange}
                />
              </div>
            </>
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
        title="Confirm Unit Decommission"
        description="Are you sure you want to decommission this unit of measure? This action is irreversible and may impact asset quantification for multiple products."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

interface UnitKPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: "indigo" | "blue" | "purple";
}

function UnitKPICard({ title, value, subtitle, icon, color }: UnitKPICardProps) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  };

  return (
    <Card className="premium-card border-none shadow-premium relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{title}</CardTitle>
          <div className={cn("p-2 rounded-xl border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", colorMap[color])}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-3xl font-semibold tracking-tighter tabular-nums text-foreground">
            {value}
          </div>
          <p className="text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-widest">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

