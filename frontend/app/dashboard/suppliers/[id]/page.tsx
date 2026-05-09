"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin,  
  CreditCard, 
  Star,
  Package,
  TrendingUp,
  Clock,
  Plus,
  Trash2
} from "lucide-react";

import { useSupplier, useSupplierPerformance, useUnlinkProduct } from "@/hooks/use-suppliers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LinkProductModal } from "@/components/suppliers/link-product-modal";

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const [isLinkModalOpen, setIsLinkModalOpen] = React.useState(false);
  const [unlinkProductId, setUnlinkProductId] = React.useState<number | null>(null);

  const { data: supplier, isLoading, isError, refetch } = useSupplier(id);
  const { data: performance } = useSupplierPerformance(id);
  const unlinkMutation = useUnlinkProduct();

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 col-span-1" />
          <Skeleton className="h-48 col-span-2" />
        </div>
      </div>
    );
  }

  if (!supplier) return null;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-semiboldbold tracking-tight">{supplier.name}</h1>
          <p className="text-muted-foreground">Supplier Details & Catalog</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={supplier.is_active ? "default" : "destructive"}>
            {supplier.is_active ? "Active" : "Inactive"}
          </Badge>
          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-sm font-semibold">
            <Star className="h-3 w-3 fill-yellow-700" />
            {parseFloat(supplier.rating).toFixed(1)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{supplier.email || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{supplier.phone || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">
                  {supplier.address}<br />
                  {supplier.city}{supplier.country ? `, ${supplier.country}` : ""}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium">Payment Terms</p>
                <p className="text-sm text-muted-foreground">{supplier.payment_terms || "Standard"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance & Summary Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Delivery Performance</CardTitle>
            <CardDescription>Metrics based on recent purchase orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span className="text-xs uppercase font-semibold">Total Orders</span>
                </div>
                <div className="text-2xl font-semibold">{performance?.total_closed_orders ?? 0}</div>
              </div>
              <div className="flex flex-col gap-1 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs uppercase font-semibold">On-Time Rate</span>
                </div>
                <div className="text-2xl font-semibold">
                  {performance?.on_time_rate ? `${(performance.on_time_rate * 100).toFixed(0)}%` : "N/A"}
                </div>
              </div>
              <div className="flex flex-col gap-1 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-xs uppercase font-semibold">On-Time Deliveries</span>
                </div>
                <div className="text-2xl font-semibold">{performance?.on_time_deliveries ?? 0}</div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-4">Supplier Insights</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Preferred status</span>
                  <Badge variant={supplier.products?.some(p => p.pivot?.is_preferred) ? "default" : "outline"}>
                    {supplier.products?.some(p => p.pivot?.is_preferred) ? "Preferred for some products" : "Regular"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Vendor since</span>
                  <span>{new Date(supplier.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Linked Products Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Supplied Products</CardTitle>
            <CardDescription>Items provided by this vendor and procurement details.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setIsLinkModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Link Product
          </Button>
        </CardHeader>
        <CardContent>
          {!supplier.products?.length ? (
            <EmptyState
              title="No products linked"
              description="This supplier isn't linked to any products yet."
              icon={<Package className="h-10 w-10 text-muted-foreground" />}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Supplier SKU</TableHead>
                  <TableHead className="text-right">Cost Price</TableHead>
                  <TableHead className="text-right">Lead Time (Est.)</TableHead>
                  <TableHead className="text-right">Min Order Qty</TableHead>
                  <TableHead className="text-center">Preferred?</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplier.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.pivot?.supplier_sku || "-"}</TableCell>
                    <TableCell className="text-right">${Number(product.pivot?.cost_price || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{product.pivot?.est_delivery_days} days</TableCell>
                    <TableCell className="text-right">{product.pivot?.min_order_qty}</TableCell>
                    <TableCell className="text-center">
                      {product.pivot?.is_preferred ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Yes</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setUnlinkProductId(product.id)}
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

      <LinkProductModal
        supplierId={id}
        open={isLinkModalOpen}
        onOpenChange={setIsLinkModalOpen}
      />

      <ConfirmDialog
        open={unlinkProductId !== null}
        onOpenChange={(open) => !open && setUnlinkProductId(null)}
        title="Unlink Product"
        description="Are you sure you want to remove this product from the supplier's catalog? This won't delete the product from the system."
        confirmText="Unlink"
        onConfirm={async () => {
          if (unlinkProductId) {
            await unlinkMutation.mutateAsync({ supplierId: id, productId: unlinkProductId });
            setUnlinkProductId(null);
          }
        }}
        isLoading={unlinkMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
