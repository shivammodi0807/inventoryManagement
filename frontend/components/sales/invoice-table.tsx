"use client";

import * as React from "react";
import { format } from "date-fns";
import { Download, ExternalLink, MoreHorizontal, FileText, ShoppingCart, User, Calendar, DollarSign, Wallet } from "lucide-react";
import Link from "next/link";

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
import { Invoice } from "@/types/sales";
import { cn } from "@/lib/utils";

interface InvoiceTableProps {
  data: Invoice[];
}

export function InvoiceTable({ data }: InvoiceTableProps) {
  const statusConfig: Record<string, { label: string, color: string }> = {
    unpaid: { label: "Unpaid", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    partial: { label: "Partial", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    paid: { label: "Paid", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    overdue: { label: "Overdue", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  };

  return (
    <div className="premium-card border-none shadow-premium overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-secondary/30 border-b border-border/40">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Registry Entry</TableHead>
              <TableHead className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Associated Order</TableHead>
              <TableHead className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Entity / Customer</TableHead>
              <TableHead className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Issuance Date</TableHead>
              <TableHead className="py-4 px-6 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Total Value</TableHead>
              <TableHead className="py-4 px-6 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Balance Due</TableHead>
              <TableHead className="py-4 px-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center p-0">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="size-10 text-muted-foreground/20" />
                    <p className="text-sm font-semibold text-muted-foreground/50 uppercase tracking-widest">Zero Invoices Registered</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((invoice) => (
                <TableRow key={invoice.id} className="group hover:bg-primary/[0.02] transition-colors border-b border-border/40 last:border-0">
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-transform">
                        <FileText className="size-4.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground font-mono text-[11px] tracking-wider uppercase">
                          {invoice.invoice_number}
                        </p>
                        <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-tighter">System ID: INV-{invoice.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <Link 
                      href={`/dashboard/sales/orders/${invoice.sales_order_id}`}
                      className="flex items-center gap-2 group/link"
                    >
                      <ShoppingCart className="size-3.5 text-muted-foreground/60 group-hover/link:text-primary transition-colors" />
                      <span className="text-xs font-semibold text-muted-foreground group-hover/link:text-primary underline decoration-primary/20 underline-offset-4 transition-all">
                        {invoice.sales_order?.order_number}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-secondary flex items-center justify-center border border-border/40">
                        <User className="size-3 text-muted-foreground" />
                      </div>
                      <span className="text-xs font-semibold text-foreground/80 uppercase tracking-tight truncate max-w-[150px]">
                        {invoice.sales_order?.customer?.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <Calendar className="size-3.5" />
                      {invoice.created_at ? format(new Date(invoice.created_at), "MMM d, yyyy") : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6 text-right">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center text-sm font-semibold text-foreground tabular-nums">
                        <DollarSign className="size-3 text-muted-foreground/50 mr-0.5" />
                        {Number(invoice.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <p className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-tighter">Gross Amount</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6 text-right">
                    <div className="flex flex-col items-end">
                      <div className={cn(
                        "flex items-center text-sm font-semibold tabular-nums",
                        Number(invoice.balance_due) > 0 ? "text-rose-600" : "text-emerald-600"
                      )}>
                        <Wallet className="size-3 mr-1 opacity-50" />
                        {Number(invoice.balance_due).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <p className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-tighter">Receivable</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6 text-center">
                    <Badge variant="outline" className={cn(
                      "capitalize font-semibold text-[10px] px-2.5 py-0.5 rounded-md border-none tracking-widest",
                      statusConfig[invoice.status]?.color || "bg-secondary/20 text-muted-foreground"
                    )}>
                      {statusConfig[invoice.status]?.label || invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5 px-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-secondary transition-all">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/40 shadow-premium">
                        <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Management</DropdownMenuLabel>
                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-semibold text-xs">
                          <Link href={`/dashboard/sales/orders/${invoice.sales_order_id}`} className="gap-2">
                            <ExternalLink className="size-3.5 text-primary" /> System Trace
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-semibold text-xs text-primary focus:text-primary">
                          <a href={getInvoicePdfUrl(invoice.id)} target="_blank" rel="noopener noreferrer" className="gap-2">
                            <Download className="size-3.5" /> Export Document
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
