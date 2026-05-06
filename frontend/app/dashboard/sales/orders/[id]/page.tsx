"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Download, 
  CreditCard,
  MapPin,
  Package
} from "lucide-react";

import { 
  useSalesOrder, 
  useConfirmSalesOrder, 
  useCancelSalesOrder,
  useShipSalesOrder,
  useDeliverSalesOrder,
  useGenerateInvoice 
} from "@/hooks/use-sales-orders";
import { SalesOrderItem, Payment } from "@/types/sales";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PaymentModal } from "@/components/sales/payment-modal";
import { getInvoicePdfUrl } from "@/lib/sales";

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const { data: order, isLoading, isError, refetch } = useSalesOrder(id);
  
  const confirmMutation = useConfirmSalesOrder();
  const cancelMutation = useCancelSalesOrder();
  const generateInvoiceMutation = useGenerateInvoice();
  const shipMutation = useShipSalesOrder();
  const deliverMutation = useDeliverSalesOrder();

  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean;
    type: "confirm" | "cancel" | "invoice" | "ship" | "deliver" | null;
  }>({ open: false, type: null });

  const [paymentModalOpen, setPaymentModalOpen] = React.useState(false);

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-[300px]" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[400px] md:col-span-2" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  const isPending = order.status === "pending";
  const isConfirmed = order.status === "confirmed";
  const hasInvoice = !!order.invoice;

  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    confirmed: "default",
    shipped: "default",
    delivered: "default",
    cancelled: "destructive",
  };

  return (
    <div className="flex flex-col gap-6 p-6 pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order {order.order_number}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={statusVariants[order.status] || "outline"}>
                {order.status.toUpperCase()}
              </Badge>
              <span className="text-muted-foreground text-sm">
                Placed on {format(new Date(order.order_date), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isPending && (
            <>
              <Button 
                variant="outline" 
                className="text-destructive"
                onClick={() => setConfirmDialog({ open: true, type: "cancel" })}
              >
                <XCircle className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button onClick={() => setConfirmDialog({ open: true, type: "confirm" })}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm & Deduct Stock
              </Button>
            </>
          )}

          {isConfirmed && !hasInvoice && (
            <Button onClick={() => setConfirmDialog({ open: true, type: "invoice" })}>
              <FileText className="mr-2 h-4 w-4" /> Generate Invoice
            </Button>
          )}

          {isConfirmed && (
            <Button variant="outline" onClick={() => setConfirmDialog({ open: true, type: "ship" })}>
              <Package className="mr-2 h-4 w-4" /> Mark as Shipped
            </Button>
          )}

          {order.status === "shipped" && (
            <Button onClick={() => setConfirmDialog({ open: true, type: "deliver" })}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Delivered
            </Button>
          )}

          {order.invoice && (
            <>
              <Button variant="outline" asChild>
                <a href={getInvoicePdfUrl(order.invoice.id)} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" /> Download Invoice
                </a>
              </Button>
              {order.invoice.status !== "paid" && (
                <Button onClick={() => setPaymentModalOpen(true)}>
                  <CreditCard className="mr-2 h-4 w-4" /> Record Payment
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items?.map((item: SalesOrderItem) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.product?.name}</div>
                          <div className="text-xs text-muted-foreground">SKU: {item.product?.sku}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            {item.warehouse?.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${Number(item.unit_price).toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${(item.quantity * Number(item.unit_price)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-[300px] space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${Number(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${Number(order.tax_total).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>${Number(order.grand_total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.invoice && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Invoice & Payments</CardTitle>
                  <Badge variant={order.invoice.status === "paid" ? "default" : "secondary"}>
                    {order.invoice.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Invoice #</div>
                    <div className="font-mono font-medium">{order.invoice.invoice_number}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                    <div className="font-medium">${Number(order.invoice.total_amount).toFixed(2)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Paid Amount</div>
                    <div className="font-medium text-green-600">${Number(order.invoice.paid_amount).toFixed(2)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Balance Due</div>
                    <div className="font-medium text-destructive">${Number(order.invoice.balance_due).toFixed(2)}</div>
                  </div>
                </div>

                {order.invoice.payments && order.invoice.payments.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Payment History</h4>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Date</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Ref #</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.invoice.payments.map((payment: Payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>{format(new Date(payment.payment_date), "MMM d, yyyy")}</TableCell>
                              <TableCell className="capitalize">{payment.payment_method.replace('_', ' ')}</TableCell>
                              <TableCell className="text-xs">{payment.transaction_id || '-'}</TableCell>
                              <TableCell className="text-right font-medium">${Number(payment.amount).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold">{order.customer?.name}</div>
                  <div className="text-sm text-muted-foreground">{order.customer?.email}</div>
                  <div className="text-sm text-muted-foreground">{order.customer?.phone}</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="text-sm">
                  <div className="font-medium">Shipping Address</div>
                  <div className="text-muted-foreground">{order.shipping_address || "Default address"}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center"><Calendar className="h-4 w-4 mr-2" /> Date</span>
                <span>{format(new Date(order.order_date), "MMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center"><Package className="h-4 w-4 mr-2" /> Items</span>
                <span>{order.items?.length} items</span>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, type: null })}
        title={
          confirmDialog.type === "confirm" ? "Confirm Sales Order" :
          confirmDialog.type === "cancel" ? "Cancel Sales Order" :
          confirmDialog.type === "ship" ? "Mark as Shipped" :
          confirmDialog.type === "deliver" ? "Mark as Delivered" :
          "Generate Invoice"
        }
        description={
          confirmDialog.type === "confirm" ? "This will confirm the order and automatically deduct stock from selected warehouses. Proceed?" :
          confirmDialog.type === "cancel" ? "Are you sure you want to cancel this order? This action cannot be undone." :
          confirmDialog.type === "ship" ? "Are you sure you want to mark this order as shipped? This will update the order status." :
          confirmDialog.type === "deliver" ? "Are you sure you want to mark this order as delivered? This will finalize the order status." :
          "This will generate a tax invoice and lock the order for modifications. Proceed?"
        }
        confirmText={
          confirmDialog.type === "confirm" ? "Confirm & Deduct" :
          confirmDialog.type === "cancel" ? "Cancel Order" :
          confirmDialog.type === "ship" ? "Ship Order" :
          confirmDialog.type === "deliver" ? "Deliver Order" :
          "Generate"
        }
        variant={confirmDialog.type === "cancel" ? "destructive" : "default"}
        onConfirm={async () => {
          if (confirmDialog.type === "confirm") await confirmMutation.mutateAsync(id);
          if (confirmDialog.type === "cancel") await cancelMutation.mutateAsync(id);
          if (confirmDialog.type === "invoice") await generateInvoiceMutation.mutateAsync(id);
          if (confirmDialog.type === "ship") await shipMutation.mutateAsync(id);
          if (confirmDialog.type === "deliver") await deliverMutation.mutateAsync(id);
          setConfirmDialog({ open: false, type: null });
        }}
        isLoading={
          confirmMutation.isPending || 
          cancelMutation.isPending || 
          generateInvoiceMutation.isPending || 
          shipMutation.isPending || 
          deliverMutation.isPending
        }
      />

      <PaymentModal
        invoice={order.invoice}
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
      />
    </div>
  );
}
