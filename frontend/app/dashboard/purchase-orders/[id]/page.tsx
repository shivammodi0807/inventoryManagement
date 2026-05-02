"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Building2, Calendar, FileText, CheckCircle2, Send, XCircle, Package } from "lucide-react";

import { 
  usePurchaseOrder, 
  useSubmitPurchaseOrder, 
  useConfirmPurchaseOrder, 
  useCancelPurchaseOrder 
} from "@/hooks/use-purchase-orders";
import { PurchaseOrderStatus } from "@/types/purchase-order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { POStatusBadge } from "@/components/purchase-orders/po-status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ReceivePOModal } from "@/components/purchase-orders/receive-po-modal";

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const { data, isLoading, isError, refetch } = usePurchaseOrder(id);
  
  const submitMutation = useSubmitPurchaseOrder();
  const confirmMutation = useConfirmPurchaseOrder();
  const cancelMutation = useCancelPurchaseOrder();

  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean;
    type: "submit" | "confirm" | "cancel" | null;
  }>({ open: false, type: null });

  const [receiveModalOpen, setReceiveModalOpen] = React.useState(false);

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const order = data?.data;

  const handleAction = async () => {
    if (!confirmDialog.type) return;
    try {
      if (confirmDialog.type === "submit") await submitMutation.mutateAsync(id);
      if (confirmDialog.type === "confirm") await confirmMutation.mutateAsync(id);
      if (confirmDialog.type === "cancel") await cancelMutation.mutateAsync(id);
      setConfirmDialog({ open: false, type: null });
    } catch (error) {
      // toast handles errors
    }
  };

  const isActionLoading = submitMutation.isPending || confirmMutation.isPending || cancelMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-[300px]" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[200px] md:col-span-2" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  const isDraft = order.status === PurchaseOrderStatus.Draft;
  const isSubmitted = order.status === PurchaseOrderStatus.Submitted;
  const isConfirmed = order.status === PurchaseOrderStatus.Confirmed;
  const isPartiallyReceived = order.status === PurchaseOrderStatus.PartiallyReceived;
  const isReceivable = isConfirmed || isPartiallyReceived;
  const isCancellable = ![PurchaseOrderStatus.Received, PurchaseOrderStatus.Cancelled].includes(order.status);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchase Order {order.po_number}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <POStatusBadge status={order.status} />
              <span className="text-muted-foreground text-sm">
                Created on {format(new Date(order.created_at), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isCancellable && (
            <Button 
              variant="outline" 
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmDialog({ open: true, type: "cancel" })}
            >
              <XCircle className="mr-2 h-4 w-4" /> Cancel PO
            </Button>
          )}
          {isDraft && (
            <Button onClick={() => setConfirmDialog({ open: true, type: "submit" })}>
              <Send className="mr-2 h-4 w-4" /> Submit to Supplier
            </Button>
          )}
          {isSubmitted && (
            <Button onClick={() => setConfirmDialog({ open: true, type: "confirm" })}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Order
            </Button>
          )}
          {isReceivable && (
            <Button onClick={() => setReceiveModalOpen(true)}>
              <Package className="mr-2 h-4 w-4" /> Receive Stock
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Ordered</TableHead>
                      <TableHead className="text-right">Received</TableHead>
                      <TableHead className="text-right">Total Line Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.product?.name}</div>
                          <div className="text-xs text-muted-foreground">SKU: {item.product?.sku}</div>
                        </TableCell>
                        <TableCell className="text-right">${parseFloat(item.cost_price).toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.qty_ordered}</TableCell>
                        <TableCell className="text-right">
                          <span className={item.qty_received < item.qty_ordered ? "text-amber-600" : "text-green-600"}>
                            {item.qty_received}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${parseFloat(item.total_price).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-end">
                <div className="w-[300px] space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax / Shipping</span>
                    <span>$0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">{order.supplier?.name}</div>
                  <div className="text-sm text-muted-foreground">{order.supplier?.email}</div>
                  <div className="text-sm text-muted-foreground">{order.supplier?.phone}</div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center"><Calendar className="h-4 w-4 mr-2"/> Order Date</span>
                  <span className="font-medium">{format(new Date(order.order_date), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center"><Calendar className="h-4 w-4 mr-2"/> Exp. Delivery</span>
                  <span className="font-medium">
                    {order.exp_delivery ? format(new Date(order.exp_delivery), "MMM d, yyyy") : "Not Set"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.description && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Action Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, type: null })}
        title={
          confirmDialog.type === "submit" ? "Submit Purchase Order" :
          confirmDialog.type === "confirm" ? "Confirm Purchase Order" :
          "Cancel Purchase Order"
        }
        description={
          confirmDialog.type === "submit" ? "This will change the status to 'Submitted'. Are you sure?" :
          confirmDialog.type === "confirm" ? "This confirms the order has been acknowledged by the supplier and stock is expected." :
          "Are you sure you want to cancel this order? This action cannot be undone."
        }
        confirmText={
          confirmDialog.type === "submit" ? "Submit Order" :
          confirmDialog.type === "confirm" ? "Confirm Order" :
          "Cancel Order"
        }
        variant={confirmDialog.type === "cancel" ? "destructive" : "default"}
        onConfirm={handleAction}
        isLoading={isActionLoading}
      />

      {/* Receive Stock Modal */}
      <ReceivePOModal
        order={order}
        open={receiveModalOpen}
        onOpenChange={setReceiveModalOpen}
      />
    </div>
  );
}
