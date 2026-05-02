"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import { getProducts } from "@/lib/inventory";
import { ProductsTable } from "@/components/inventory/products-table";
import { StockAdjustModal } from "@/components/inventory/stock-adjust-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
import { Package } from "lucide-react";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can } = useAuth();
  
  const [adjustingProduct, setAdjustingProduct] = React.useState<Product | null>(null);

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", { page, search }],
    queryFn: () => getProducts({ page, search, per_page: 10 }),
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/dashboard/inventory/products?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/dashboard/inventory/products?${params.toString()}`);
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
        {can("create", "product") && (
          <Button asChild>
            <Link href="/dashboard/inventory/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory List</CardTitle>
              <CardDescription>
                A comprehensive list of all products in your catalog.
              </CardDescription>
            </div>
            <form onSubmit={handleSearch} className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                type="search"
                placeholder="Search SKU or name..."
                className="pl-8"
                defaultValue={search}
              />
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columnCount={7} rowCount={10} paged />
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
    </div>
  );
}
