"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User as UserIcon, Warehouse as WarehouseIcon, Edit, History, Truck, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { getProduct, getProductHistory } from "@/lib/inventory";
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
import { Badge } from "@/components/ui/badge";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StockAdjustModal } from "@/components/inventory/stock-adjust-modal";
import { LinkSupplierModal } from "@/components/inventory/link-supplier-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useUnlinkProduct } from "@/hooks/use-suppliers";
import { Product, SupplierLink } from "@/types/inventory";

const stockStatusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  normal: "default",
  low: "secondary",
  critical: "destructive",
  out: "destructive",
};

const logTypeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  receipt: "default",
  sale: "secondary",
  adjustment: "outline",
  damage: "destructive",
  return: "outline",
  transfer: "secondary",
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { can } = useAuth();
  const id = parseInt(params.id as string);

  const [adjustingProduct, setAdjustingProduct] = React.useState<Product | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = React.useState(false);
  const [unlinkingSupplierId, setUnlinkingSupplierId] = React.useState<number | null>(null);

  const unlinkMutation = useUnlinkProduct();

  const {
    data: product,
    isLoading: isLoadingProduct,
    isError: isErrorProduct,
    refetch: refetchProduct,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
  });

  const {
    data: history,
    isLoading: isLoadingHistory,
    isError: isErrorHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["product-history", id],
    queryFn: () => getProductHistory(id),
  });

  const isError = isErrorProduct || isErrorHistory;
  const refetchAll = () => {
    refetchProduct();
    refetchHistory();
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            {isLoadingProduct ? (
              <>
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-4 w-32 mt-2" />
              </>
            ) : (
              <div className="flex items-start gap-6">
                {product?.image_url && (
                  <div className="relative h-24 w-24 overflow-hidden rounded-lg border bg-muted shadow-sm">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight">{product?.name}</h1>
                  <p className="text-muted-foreground">SKU: {product?.sku}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        {!isLoadingProduct && product && can("edit", "product") && (
          <div className="flex gap-2">
            {can("edit", "product") && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/inventory/products/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Product
                </Link>
              </Button>
            )}
            <Button size="sm" onClick={() => setAdjustingProduct(product)}>
              Adjust Stock
            </Button>
          </div>
        )}
      </div>

      {isError ? (
        <ErrorState onRetry={refetchAll} />
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Stock</CardDescription>
                {isLoadingProduct ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <CardTitle className="text-4xl">{product?.total_stock ?? 0}</CardTitle>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Across {product?.stock_levels?.length ?? 0} warehouse{(product?.stock_levels?.length ?? 0) !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Unit Price</CardDescription>
                {isLoadingProduct ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <CardTitle className="text-4xl">
                    ${parseFloat(product?.unit_price || "0").toFixed(2)}
                  </CardTitle>
                )}
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Reorder Point</CardDescription>
                {isLoadingProduct ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <CardTitle className="text-4xl">{product?.reorder_point ?? 0}</CardTitle>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Lead time: {product?.lead_time_days ?? 0} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Stock Status</CardDescription>
                {isLoadingProduct ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <CardTitle className="text-2xl">
                    <Badge
                      variant={stockStatusVariant[product?.stock_status ?? "normal"] ?? "outline"}
                      className="text-sm capitalize"
                    >
                      {product?.stock_status ?? "—"}
                    </Badge>
                  </CardTitle>
                )}
              </CardHeader>
            </Card>
          </div>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                  <p>{product?.category?.name ?? "Uncategorized"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Unit of Measure</h4>
                  <p>{product?.unit?.name} ({product?.unit?.abbreviation})</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <Badge variant={product?.is_active ? "default" : "secondary"}>
                    {product?.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {product?.description || "No description provided."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Cost Price</h4>
                    <p>${parseFloat(product?.cost_price || "0").toFixed(2)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Reorder Quantity</h4>
                    <p>{product?.reorder_quantity ?? 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Per-warehouse stock breakdown */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <WarehouseIcon className="h-4 w-4 text-muted-foreground" />
                <CardTitle>Stock by Warehouse</CardTitle>
              </div>
              <CardDescription>
                Current stock levels broken down by storage location.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProduct ? (
                <DataTableSkeleton columnCount={4} rowCount={3} />
              ) : !product?.stock_levels?.length ? (
                <EmptyState
                  title="No stock recorded"
                  description="No stock movements have been made for this product yet."
                  icon={<WarehouseIcon className="h-8 w-8 text-muted-foreground" />}
                  action={can("edit", "product") ? {
                    label: "Adjust Stock",
                    onClick: () => product && setAdjustingProduct(product),
                  } : undefined}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Total Stock</TableHead>
                      <TableHead className="text-right">Reserved</TableHead>
                      <TableHead className="text-right">Available</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.stock_levels.map((sl) => {
                      const available = sl.current_stock;
                      const isLow = available <= (product.reorder_point ?? 0);
                      return (
                        <TableRow key={sl.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <WarehouseIcon className="h-3.5 w-3.5 text-muted-foreground" />
                              {sl.warehouse?.name ?? `Warehouse #${sl.warehouse_id}`}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {sl.warehouse?.location ?? "—"}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {sl.total_stock}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {sl.stock_reserved}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {available}
                          </TableCell>
                          <TableCell>
                            <Badge variant={isLow ? "destructive" : "default"}>
                              {isLow ? "Low" : "OK"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Inventory History */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <CardTitle>Inventory History</CardTitle>
              </div>
              <CardDescription>Full audit log of stock movements for this product.</CardDescription>
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
                        <TableCell className="whitespace-nowrap text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={logTypeVariant[log.type] ?? "outline"}
                            className="capitalize"
                          >
                            {log.type}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            log.quantity_change > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {log.quantity_change > 0 ? "+" : ""}
                          {log.quantity_change}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {log.quantity_after}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <UserIcon className="h-3 w-3" />
                            {log.user?.full_name || "System"}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm" title={log.notes || ""}>
                          {log.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          {/* Suppliers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <CardTitle>Suppliers & Sourcing</CardTitle>
                </div>
                <CardDescription>Vendors providing this product and their pricing.</CardDescription>
              </div>
              {can("edit", "product") && (
                <Button size="sm" variant="outline" onClick={() => setIsLinkModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Supplier
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingProduct ? (
                <DataTableSkeleton columnCount={5} rowCount={2} />
              ) : !product?.suppliers?.length ? (
                <EmptyState
                  title="No suppliers linked"
                  description="You haven't defined any suppliers for this product yet."
                  icon={<Truck className="h-8 w-8 text-muted-foreground" />}
                  action={can("edit", "product") ? {
                    label: "Add Supplier",
                    onClick: () => setIsLinkModalOpen(true),
                  } : undefined}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Vendor SKU</TableHead>
                      <TableHead className="text-right">Cost Price</TableHead>
                      <TableHead className="text-right">Lead Time</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.suppliers.map((s: SupplierLink) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{s.name}</span>
                            <span className="text-xs text-muted-foreground font-normal">{s.email || s.phone || "No contact info"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-mono">{s.supplier_sku || "—"}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${parseFloat(s.cost_price).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {s.est_delivery_days} days
                        </TableCell>
                        <TableCell className="text-center">
                          {s.is_preferred ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Preferred</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Regular</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => setUnlinkingSupplierId(s.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Stock adjust modal */}
      <StockAdjustModal
        product={adjustingProduct}
        isOpen={!!adjustingProduct}
        onClose={() => setAdjustingProduct(null)}
      />

      <LinkSupplierModal
        productId={id}
        open={isLinkModalOpen}
        onOpenChange={setIsLinkModalOpen}
      />

      <ConfirmDialog
        open={unlinkingSupplierId !== null}
        onOpenChange={(open) => !open && setUnlinkingSupplierId(null)}
        title="Unlink Supplier"
        description="Are you sure you want to remove this supplier from the product? This will not delete the supplier from the system."
        confirmText="Unlink"
        variant="destructive"
        onConfirm={async () => {
          if (unlinkingSupplierId) {
            await unlinkMutation.mutateAsync({ supplierId: unlinkingSupplierId, productId: id });
            setUnlinkingSupplierId(null);
            refetchProduct();
          }
        }}
        isLoading={unlinkMutation.isPending}
      />
    </div>
  );
}
