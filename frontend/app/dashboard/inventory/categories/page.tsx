"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Loader2, FolderTree } from "lucide-react";
import { useState } from "react";

import { getCategories } from "@/lib/inventory";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
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
import { useAuth } from "@/hooks/use-auth";
import { CategoryModal } from "@/components/inventory/category-modal";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";

export default function CategoriesPage() {
  const { can } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: categories, isLoading, isError, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Organize your products into logical groups.
          </p>
        </div>
        {can("create", "category") && (
          <>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
            <CategoryModal open={isModalOpen} onOpenChange={setIsModalOpen} />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Hierarchy</CardTitle>
          <CardDescription>
            Manage the classification of your inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columnCount={3} rowCount={5} />
          ) : isError ? (
            <ErrorState 
              title="Failed to load categories" 
              onRetry={() => refetch()} 
            />
          ) : !categories?.data?.length ? (
            <EmptyState
              title="No categories found"
              description="Organize your products by creating categories."
              icon={<FolderTree className="h-10 w-10 text-muted-foreground" />}
              action={can("create", "category") ? {
                label: "Add Category",
                onClick: () => setIsModalOpen(true)
              } : undefined}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.data.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                        {category.name}
                      </div>
                    </TableCell>
                    <TableCell>{category.description || "-"}</TableCell>
                    <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
