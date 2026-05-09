"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  RowData,
} from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    onEdit?: (data: TData) => void;
    onDelete?: (data: TData) => void;
  }
}
import { MoreHorizontal, Pencil, Trash2, Mail, Phone, MapPin, User, ChevronLeft, ChevronRight } from "lucide-react";

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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { cn } from "@/lib/utils";

interface CustomerTableProps {
  data: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomerTable({ data, onEdit, onDelete }: CustomerTableProps) {
  const columns = React.useMemo<ColumnDef<Customer>[]>(() => [
    {
      accessorKey: "name",
      header: "Identity",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
            <User className="size-4.5" />
          </div>
          <div>
            <p className="font-semiboldbold text-foreground uppercase tracking-tight text-[11px] leading-none mb-1">
              {row.getValue("name")}
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-tighter">Registered Client</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "contact",
      header: "Contact Protocols",
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex flex-col gap-1.5">
            {customer.email && (
              <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider group/email transition-colors">
                <Mail className="h-3 w-3 text-primary/40 group-hover/email:text-primary transition-colors" /> 
                {customer.email}
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                <Phone className="h-3 w-3 text-primary/40" /> 
                {customer.phone}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "address",
      header: "Strategic Location",
      cell: ({ row }) => {
        const address = row.getValue("address") as string;
        if (!address) return <span className="text-[10px] font-semibold text-muted-foreground/20 italic uppercase tracking-widest">No Location Logged</span>;
        return (
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground leading-tight max-w-[200px]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/30" /> 
            {address}
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Access Status",
      cell: ({ row }) => (
        <Badge variant="outline" className={cn(
          "font-semibold text-[10px] px-2.5 py-0.5 rounded-md border-none tracking-widest",
          row.getValue("is_active") ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
        )}>
          {row.getValue("is_active") ? "ACTIVE" : "RESTRICTED"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row, table }) => {
        const customer = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-secondary transition-all">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/40 shadow-premium">
              <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Client Management</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => table.options.meta?.onEdit?.(customer)} className="rounded-lg cursor-pointer font-semibold text-xs gap-2">
                <Pencil className="size-3.5 text-primary" /> Modify Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => table.options.meta?.onDelete?.(customer)}
                className="rounded-lg cursor-pointer font-semibold text-xs gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-500/10"
              >
                <Trash2 className="size-3.5" /> Terminate Access
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

  const tableMeta = React.useMemo(() => ({
    onEdit,
    onDelete,
  }), [onEdit, onDelete]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: tableMeta,
  });

  return (
    <div className="premium-card border-none shadow-premium overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-secondary/30 border-b border-border/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="group hover:bg-primary/[0.02] transition-colors border-b border-border/40 last:border-0">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-5 px-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center p-0">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <User className="size-10 text-muted-foreground/20" />
                    <p className="text-sm font-semibold text-muted-foreground/50 uppercase tracking-widest">No Client Records Found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Strip */}
      <div className="flex items-center justify-between p-4 bg-secondary/10 border-t border-border/40">
        <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest">
           Showing {table.getRowModel().rows.length} of {data.length} profiles
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg h-8 px-3 font-semibold text-[10px] uppercase tracking-widest gap-1"
          >
            <ChevronLeft className="size-3" /> Prev
          </Button>
          <div className="w-[1px] h-4 bg-border/40 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg h-8 px-3 font-semibold text-[10px] uppercase tracking-widest gap-1"
          >
            Next <ChevronRight className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
