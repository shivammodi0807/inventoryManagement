"use client";

import { format } from "date-fns";
import { Download, ExternalLink, MoreHorizontal, FileText } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInvoicePdfUrl } from "@/lib/sales";
import Link from "next/link";

interface InvoiceTableProps {
  data: any[];
}

export function InvoiceTable({ data }: InvoiceTableProps) {
  const statusVariants: any = {
    unpaid: "secondary",
    partial: "warning",
    paid: "success",
    overdue: "destructive",
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Order #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-mono font-medium">
                {invoice.invoice_number}
              </TableCell>
              <TableCell>
                <Link 
                  href={`/dashboard/sales/orders/${invoice.sales_order_id}`}
                  className="text-primary hover:underline"
                >
                  {invoice.sales_order?.order_number}
                </Link>
              </TableCell>
              <TableCell>{invoice.sales_order?.customer?.name}</TableCell>
              <TableCell>
                {format(new Date(invoice.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-right font-medium">
                ${Number(invoice.total_amount).toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                <span className={invoice.balance_due > 0 ? "text-destructive font-medium" : "text-green-600"}>
                  ${Number(invoice.balance_due).toFixed(2)}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariants[invoice.status] || "outline"}>
                  {invoice.status.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/sales/orders/${invoice.sales_order_id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" /> View Order
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href={getInvoicePdfUrl(invoice.id)} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
