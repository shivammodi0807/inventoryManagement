"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { MoreHorizontal, Eye, CheckCircle, XCircle, FileText, Download } from "lucide-react";
import { format } from "date-fns";

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
import { useRouter } from "next/navigation";
import { getInvoicePdfUrl } from "@/lib/sales";

interface SalesOrderTableProps {
  data: any[];
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
  onGenerateInvoice: (id: number) => void;
}

export function SalesOrderTable({ data, onConfirm, onCancel, onGenerateInvoice }: SalesOrderTableProps) {
  const router = useRouter();

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "order_number",
      header: "Order #",
      cell: ({ row }) => <span className="font-mono font-bold">{row.getValue("order_number")}</span>,
    },
    {
      accessorKey: "customer.name",
      header: "Customer",
      cell: ({ row }) => <div>{row.original.customer?.name}</div>,
    },
    {
      accessorKey: "order_date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.getValue("order_date")), "MMM dd, yyyy"),
    },
    {
      accessorKey: "grand_total",
      header: "Total",
      cell: ({ row }) => (
        <div className="font-semibold">
          ${Number(row.getValue("grand_total")).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variants: any = {
          pending: "secondary",
          confirmed: "blue",
          shipped: "indigo",
          delivered: "success",
          cancelled: "destructive",
        };
        return <Badge variant={variants[status] || "outline"}>{status.toUpperCase()}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/sales/orders/${order.id}`)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              
              {order.status === "pending" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onConfirm(order.id)}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Confirm Order
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCancel(order.id)} className="text-destructive">
                    <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                  </DropdownMenuItem>
                </>
              )}

              {order.status === "confirmed" && !order.invoice && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onGenerateInvoice(order.id)}>
                    <FileText className="mr-2 h-4 w-4" /> Generate Invoice
                  </DropdownMenuItem>
                </>
              )}

              {order.invoice && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href={getInvoicePdfUrl(order.invoice.id)} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" /> Download Invoice
                    </a>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No sales orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 p-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
