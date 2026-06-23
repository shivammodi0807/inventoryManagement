"use client";

import React, { useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  RowData,
} from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    onConfirm?: (id: number) => void;
    onCancel?: (id: number) => void;
    onGenerateInvoice?: (id: number) => void;
  }
}
import { MoreHorizontal, Eye, CheckCircle, XCircle, FileText, Download, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

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
import { useExportInvoice } from "@/hooks/use-sales-orders";
import { SalesOrder } from "@/types/sales";
import { cn } from "@/lib/utils";

interface SalesOrderTableProps {
  data: SalesOrder[];
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
  onGenerateInvoice: (id: number) => void;
}

export function SalesOrderTable({ data, onConfirm, onCancel, onGenerateInvoice }: SalesOrderTableProps) {
  const router = useRouter();
  const exportInvoiceMutation = useExportInvoice();

  const columns = useMemo<ColumnDef<SalesOrder>[]>(() => [
    {
      accessorKey: "order_number",
      header: "Order Reference",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semiboldbold tracking-tight text-foreground">{row.getValue("order_number")}</span>
          <span className="text-[10px] uppercase font-semibold text-muted-foreground/60 tracking-widest">Standard Order</span>
        </div>
      ),
    },
    {
      accessorKey: "customer.name",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/5 text-[10px] font-semiboldbold text-primary border border-primary/10">
            {row.original.customer?.name?.charAt(0) || "C"}
          </div>
          <span className="font-medium">{row.original.customer?.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "order_date",
      header: "Order Date",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 opacity-50" />
          <span className="text-sm">{format(new Date(row.getValue("order_date")), "MMM dd, yyyy")}</span>
        </div>
      ),
    },
    {
      accessorKey: "grand_total",
      header: "Total Amount",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground tabular-nums">
            ${Number(row.getValue("grand_total")).toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">USD</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        
        const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
          pending: { 
            label: "Pending", 
            className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
            dot: "bg-amber-500"
          },
          confirmed: { 
            label: "Confirmed", 
            className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
            dot: "bg-blue-500"
          },
          shipped: { 
            label: "Shipped", 
            className: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
            dot: "bg-indigo-500"
          },
          delivered: { 
            label: "Delivered", 
            className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
            dot: "bg-emerald-500"
          },
          cancelled: { 
            label: "Cancelled", 
            className: "bg-destructive/10 text-destructive border-destructive/20",
            dot: "bg-destructive"
          },
        };

        const config = statusConfig[status] || { 
          label: status.toUpperCase(), 
          className: "bg-muted text-muted-foreground",
          dot: "bg-muted-foreground"
        };

        return (
          <Badge className={cn("px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1.5 border shadow-none", config.className)}>
            <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", config.dot)} />
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row, table }) => {
        const order = row.original;
        const meta = table.options.meta;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/5 rounded-lg">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5 shadow-premium border-border/40">
              <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-muted-foreground/60 px-2 py-1.5">Management</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/sales/orders/${order.id}`)} className="rounded-lg gap-2 cursor-pointer">
                <Eye className="h-4 w-4 opacity-70" /> View Details
              </DropdownMenuItem>

              {order.status === "pending" && (
                <>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={() => meta?.onConfirm?.(order.id)} className="rounded-lg gap-2 cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50">
                    <CheckCircle className="h-4 w-4" /> Confirm Order
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.onCancel?.(order.id)} className="rounded-lg gap-2 cursor-pointer text-destructive focus:bg-destructive/5">
                    <XCircle className="h-4 w-4" /> Cancel Order
                  </DropdownMenuItem>
                </>
              )}

              {order.status === "confirmed" && !order.invoice && (
                <>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={() => meta?.onGenerateInvoice?.(order.id)} className="rounded-lg gap-2 cursor-pointer focus:bg-primary/5 focus:text-primary">
                    <FileText className="h-4 w-4 opacity-70" /> Generate Invoice
                  </DropdownMenuItem>
                </>
              )}

              {order.invoice && (
                <>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={() => exportInvoiceMutation.mutate(order.invoice!.id)} className="rounded-lg gap-2 cursor-pointer text-primary focus:text-primary">
                    <Download className="h-4 w-4 opacity-70" /> Download Invoice
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [router]);

  const tableMeta = React.useMemo(() => ({
    onConfirm,
    onCancel,
    onGenerateInvoice,
  }), [onConfirm, onCancel, onGenerateInvoice]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: tableMeta,
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-none bg-background shadow-premium overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wider h-12 text-muted-foreground/70 first:pl-6 last:pr-6">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id} 
                  className="group hover:bg-primary/[0.02] transition-colors border-b border-border/40 last:border-0"
                  onClick={() => router.push(`/dashboard/sales/orders/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 first:pl-6 last:pr-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground font-medium italic">
                  No sales orders found in the system.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground font-medium">
          Showing <span className="font-semibold text-foreground">{table.getRowModel().rows.length}</span> of <span className="font-semibold text-foreground">{data.length}</span> orders
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              table.previousPage();
            }}
            disabled={!table.getCanPreviousPage()}
            className="rounded-xl h-9 border-border/40 hover:bg-primary/5 hover:text-primary transition-all font-semibold"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              table.nextPage();
            }}
            disabled={!table.getCanNextPage()}
            className="rounded-xl h-9 border-border/40 hover:bg-primary/5 hover:text-primary transition-all font-semibold"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
