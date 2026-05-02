"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, User as UserIcon } from "lucide-react";

import { getProduct, getProductHistory } from "@/lib/inventory";
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
import { Badge } from "@/components/ui/badge";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { History } from "lucide-react";

export default function ProductHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const { 
    data: product, 
    isLoading: isLoadingProduct, 
    isError: isErrorProduct, 
    refetch: refetchProduct 
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
  });

  const { 
    data: history, 
    isLoading: isLoadingHistory, 
    isError: isErrorHistory, 
    refetch: refetchHistory 
  } = useQuery({
    queryKey: ["product-history", id],
    queryFn: () => getProductHistory(id),
  });

  const isError = isErrorProduct || isErrorHistory;
  const refetchAll = () => {
    refetchProduct();
    refetchHistory();
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      receipt: "default",
      sale: "secondary",
      adjustment: "outline",
      damage: "destructive",
      return: "outline",
    };
    return <Badge variant={variants[type] || "outline"} className="capitalize">{type}</Badge>;
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          {isLoadingProduct ? (
            <Skeleton className="h-9 w-64" />
          ) : (
            <h1 className="text-3xl font-bold tracking-tight">{product?.name}</h1>
          )}
          {isLoadingProduct ? (
            <Skeleton className="h-4 w-32 mt-2" />
          ) : (
            <p className="text-muted-foreground">SKU: {product?.sku}</p>
          )}
        </div>
      </div>

      {isError ? (
        <ErrorState onRetry={refetchAll} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardDescription>
                    {i === 1 ? "Current Stock" : i === 2 ? "Unit Price" : "Status"}
                  </CardDescription>
                  {isLoadingProduct ? (
                    <Skeleton className="h-10 w-24" />
                  ) : (
                    <CardTitle className="text-4xl">
                      {i === 1 ? (product?.total_stock ?? 0) : 
                       i === 2 ? `$${parseFloat(product?.unit_price || "0").toFixed(2)}` : 
                       <span className="capitalize">{product?.stock_status}</span>}
                    </CardTitle>
                  )}
                </CardHeader>
                {i === 1 && (
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Across all warehouses
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory History</CardTitle>
              <CardDescription>
                Full audit log of stock movements for this product.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <DataTableSkeleton columnCount={6} rowCount={5} />
              ) : !history?.data?.length ? (
                <EmptyState
                  title="No history found"
                  description="No stock movements have been recorded for this product yet."
                  icon={<History className="h-10 w-10 text-muted-foreground" />}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                      <TableHead className="text-right">Balance After</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.data.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>{getTypeBadge(log.type)}</TableCell>
                        <TableCell className={`text-right font-medium ${log.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {log.quantity_after}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-3 w-3" />
                            {log.user?.full_name || "System"}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={log.notes || ""}>
                          {log.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
