"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FolderTree, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { getCategories, deleteCategory } from "@/lib/inventory";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
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
import { CategoryModal } from "@/components/inventory/category-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Category } from "@/types/inventory";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/shared/data-table-pagination";

export default function CategoriesPage() {
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { data: categories, isLoading, isError, refetch } = useQuery({
    queryKey: ["categories", page, perPage],
    queryFn: () => getCategories({ page, per_page: perPage }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeletingId(null);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || "Failed to delete category");
      setDeletingId(null);
    },
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Dynamic Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <FolderTree className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Inventory Taxonomy</span>
            <div className="h-1 w-12 bg-primary/20 rounded-full mt-2" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Categories</h1>
          <p className="text-base text-muted-foreground font-medium">
            Architect your product hierarchy for optimal organization and discovery.
          </p>
        </div>
        {can("create", "category") && (
          <Button onClick={handleAdd} className="h-11 px-6 rounded-xl font-semibold gap-2 shadow-premium hover:scale-[1.02] transition-all">
            <Plus className="size-5" /> Add Category
          </Button>
        )}
      </div>

      <Card className="premium-card border-none shadow-premium overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-secondary/10 pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight">Active Clusters</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">List of all product groupings and their distribution metrics</p>
            </div>
            <Badge className="font-semibold bg-primary/10 text-primary border-none text-[10px] uppercase tracking-widest px-3">
              {categories?.total || 0} Clusters Total
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
              <ErrorState title="Failed to load categories" onRetry={() => refetch()} />
            </div>
          ) : !categories?.data?.length ? (
            <div className="p-20">
              <EmptyState
                title="Taxonomy Empty"
                description="Your inventory has no established categories. Start by defining your first cluster."
                icon={<FolderTree className="size-12 text-muted-foreground/30" />}
                action={can("create", "category") ? {
                  label: "Add Category",
                  onClick: handleAdd
                } : undefined}
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-secondary/20">
                    <TableRow className="hover:bg-transparent border-border/40">
                      <TableHead className="py-5 px-6 font-semibold text-[11px] uppercase tracking-widest">Category Detail</TableHead>
                      <TableHead className="py-5 font-semibold text-[11px] uppercase tracking-widest">Strategic Description</TableHead>
                      <TableHead className="py-5 text-center font-semibold text-[11px] uppercase tracking-widest">SKU Distribution</TableHead>
                      <TableHead className="py-5 font-semibold text-[11px] uppercase tracking-widest">Creation Date</TableHead>
                      <TableHead className="py-5 w-25"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.data.map((category) => (
                      <TableRow key={category.id} className="hover:bg-secondary/20 border-border/40 transition-colors group">
                        <TableCell className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-transform">
                              <FolderTree className="size-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground tracking-tight">{category.name}</p>
                              <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">ID: CAT-{category.id.toString().padStart(4, '0')}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <p className="text-sm text-muted-foreground font-medium max-w-100 line-clamp-1 italic">
                            {category.description || "No strategic description provided."}
                          </p>
                        </TableCell>
                        <TableCell className="py-5 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary border border-border/40 rounded-lg">
                            <span className="text-sm font-semibold text-foreground tabular-nums">{category.products_count ?? 0}</span>
                            <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">SKUs</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">
                            {new Date(category.created_at).toLocaleDateString(undefined, {
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
                            <DropdownMenuContent align="end" className="w-40 rounded-xl border-border/40 shadow-premium p-1.5">
                              <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 py-2">Lifecycle Actions</DropdownMenuLabel>
                              {can("edit", "category") && (
                                <DropdownMenuItem onClick={() => handleEdit(category)} className="rounded-lg font-semibold gap-2 py-2.5">
                                  <Pencil className="size-4" /> Edit
                                </DropdownMenuItem>
                              )}
                              {can("delete", "category") && (
                                <>
                                  <DropdownMenuSeparator className="bg-border/40" />
                                  <DropdownMenuItem
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg font-semibold gap-2 py-2.5"
                                    onClick={() => setDeletingId(category.id)}
                                  >
                                    <Trash2 className="size-4" /> Delete
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
                  totalPages={categories?.last_page || 1}
                  onPageChange={handlePageChange}
                  pageSize={perPage}
                  onPageSizeChange={handlePerPageChange}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CategoryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={editingCategory}
      />

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Confirm Category Delete"
        description="Are you sure you want to delete this taxonomic cluster? This action is irreversible and may orphan multiple product assets."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
