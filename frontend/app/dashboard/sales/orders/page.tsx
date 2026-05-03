"use client";

import * as React from "react";
import { Plus, Search, ShoppingBag, CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

import { useSalesOrders, useConfirmSalesOrder, useCancelSalesOrder, useGenerateInvoice } from "@/hooks/use-sales-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SalesOrderTable } from "@/components/sales/sales-order-table";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SalesOrdersPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const { data: orders, isLoading, isError, refetch } = useSalesOrders({
    search: debouncedSearch,
  });

  const confirmMutation = useConfirmSalesOrder();
  const cancelMutation = useCancelSalesOrder();
  const generateInvoiceMutation = useGenerateInvoice();

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Orders</h1>
          <p className="text-muted-foreground">
            Create and manage customer orders and fulfillment.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/sales/orders/create")}>
          <Plus className="mr-2 h-4 w-4" /> New Sales Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.total ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Confirmation</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders?.data?.filter((o: any) => o.status === "pending").length ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders?.data?.filter((o: any) => o.status === "confirmed").length ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <DataTableSkeleton columnCount={6} rowCount={10} />
      ) : !orders?.data?.length ? (
        <EmptyState
          title="No sales orders found"
          description="Try adjusting your search or create a new order."
          icon={<ShoppingBag className="h-10 w-10 text-muted-foreground" />}
          action={{ label: "New Sales Order", onClick: () => router.push("/dashboard/sales/orders/create") }}
        />
      ) : (
        <SalesOrderTable 
          data={orders.data} 
          onConfirm={(id) => confirmMutation.mutate(id)}
          onCancel={(id) => cancelMutation.mutate(id)}
          onGenerateInvoice={(id) => generateInvoiceMutation.mutate(id)}
        />
      )}
    </div>
  );
}
