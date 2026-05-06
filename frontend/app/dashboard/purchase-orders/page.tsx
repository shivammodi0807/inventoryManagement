"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Search, Filter, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { PurchaseOrderStatus } from "@/types/purchase-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { POStatusBadge } from "@/components/purchase-orders/po-status-badge";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export default function PurchaseOrdersPage() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);
  const router = useRouter();

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, refetch } = usePurchaseOrders({
    search: debouncedSearch,
    status: status !== "all" ? (status as PurchaseOrderStatus) : undefined,
    page,
    per_page: 15,
  });

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const orders = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage your procurement workflow and incoming stock.
          </p>
        </div>
        <Link href="/dashboard/purchase-orders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create PO
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-1 max-w-sm items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search PO Number or Supplier..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.Draft}>Draft</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.Submitted}>Submitted</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.Confirmed}>Confirmed</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.PartiallyReceived}>Partially Received</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.Received}>Received</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.Cancelled}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              title="No purchase orders found"
              description="You don't have any purchase orders yet, or none match your search criteria."
              icon={<Calendar className="h-10 w-10 text-muted-foreground" />}
              action={{ label: "Create your first PO", onClick: () => router.push("/dashboard/purchase-orders/new") }}
            />
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/purchase-orders/${order.id}`} className="text-primary hover:underline">
                            {order.po_number}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{order.supplier?.name}</div>
                          <div className="text-xs text-muted-foreground">{order.supplier?.email}</div>
                        </TableCell>
                        <TableCell>{format(new Date(order.order_date), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          {order.exp_delivery ? format(new Date(order.exp_delivery), "MMM d, yyyy") : "-"}
                        </TableCell>
                        <TableCell>
                          <POStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${parseFloat(order.total_amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {meta && meta.last_page > 1 && (
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Page {meta.current_page} of {meta.last_page}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                      disabled={page === meta.last_page}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
