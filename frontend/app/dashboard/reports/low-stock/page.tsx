"use client";

import React from "react";
import { useLowStockReport } from "@/hooks/use-reports";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, AlertCircle, ShoppingCart, FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getReportExportUrl } from "@/hooks/use-reports";

export default function LowStockReportPage() {
  const { data, isLoading } = useLowStockReport();

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!data || !Array.isArray(data)) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground opacity-20" />
        <div className="text-xl font-medium text-muted-foreground">Unable to load stock data</div>
        <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/reports"><ChevronLeft className="h-4 w-4" /></Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Low Stock Analysis</h2>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Items that have fallen below their reorder point.</p>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
                <a href={getReportExportUrl("low-stock")} target="_blank">
                    <FileText className="h-4 w-4 mr-2" /> Export PDF
                </a>
            </Button>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {data.length} Items Needing Attention
            </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restock Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Reorder Point</TableHead>
                <TableHead className="text-right">Suggested Qty</TableHead>
                <TableHead>Preferred Supplier</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    All stock levels are currently healthy.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell><code>{item.sku}</code></TableCell>
                    <TableCell className="text-right">
                        <span className="text-destructive font-bold">{item.total_stock}</span>
                    </TableCell>
                    <TableCell className="text-right">{item.reorder_point}</TableCell>
                    <TableCell className="text-right font-medium">{item.reorder_quantity}</TableCell>
                    <TableCell>
                        <div>
                            <div className="font-medium">{item.preferred_supplier || "No Supplier Linked"}</div>
                            <div className="text-xs text-muted-foreground">{item.supplier_email}</div>
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/purchase-orders/create?product_id=${item.id}`}>
                                <ShoppingCart className="h-4 w-4 mr-2" /> Restock
                            </Link>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
