"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowData,
} from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    onEdit?: (data: TData) => void;
    onDelete?: (data: TData) => void;
  }
}
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  Edit, 
  Trash, 
  Eye, 
  Mail, 
  Phone, 
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react";
import Link from "next/link";

import { Supplier } from "@/types/supplier";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SupplierTableProps {
  data: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export function SupplierTable({ data, onEdit, onDelete }: SupplierTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const columns = React.useMemo<ColumnDef<Supplier>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 hover:text-foreground transition-colors group"
        >
          Company Name
          <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground tracking-tight">{row.getValue("name")}</span>
          <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
            {row.original.contact_name || "Primary Vendor"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Contact Intelligence",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          {row.original.email && (
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Mail className="h-3 w-3 text-primary/40" />
              {row.original.email}
            </div>
          )}
          {row.original.phone && (
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Phone className="h-3 w-3 text-primary/40" />
              {row.original.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Geography",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-xs font-medium text-foreground/70">
          <MapPin className="h-3.5 w-3.5 text-primary/30" />
          {row.original.city}{row.original.country ? `, ${row.original.country}` : ""}
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: "Performance",
      cell: ({ row }) => {
        const rating = parseFloat(row.getValue("rating") || "0");
        return (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "h-3 w-3", 
                    i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-muted/30"
                  )} 
                />
              ))}
            </div>
            <span className="text-xs font-semibold tabular-nums text-foreground/60">{rating.toFixed(1)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active");
        return (
          <Badge className={cn(
            "px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1.5 border shadow-none",
            isActive 
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
              : "bg-destructive/10 text-destructive border-destructive/20"
          )}>
            <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-emerald-500 animate-pulse" : "bg-destructive")} />
            {isActive ? "Active" : "Deactivated"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row, table }) => {
        const supplier = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/40 shadow-premium p-1">
              <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 py-1.5">
                Operations
              </DropdownMenuLabel>
              <DropdownMenuItem asChild className="rounded-lg font-semibold cursor-pointer">
                <Link href={`/dashboard/suppliers/${supplier.id}`}>
                  <Eye className="mr-2 h-4 w-4 text-primary/60" /> View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => table.options.meta?.onEdit?.(supplier)}
                className="rounded-lg font-semibold cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4 text-primary/60" /> Modify Details
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem 
                onClick={() => table.options.meta?.onDelete?.(supplier)}
                className="text-destructive focus:text-destructive rounded-lg font-semibold cursor-pointer"
              >
                <Trash className="mr-2 h-4 w-4" /> Deactivate Account
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
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    meta: tableMeta,
  });

  return (
    <div className="rounded-2xl border-none bg-background shadow-premium overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary/30">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-widest h-12 text-muted-foreground/70 px-6">
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
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="group hover:bg-primary/[0.02] transition-colors border-b border-border/40 last:border-0"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-4 px-6">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <Search className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">No matches found</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <div className="flex items-center justify-between px-6 py-4 bg-secondary/10 border-t border-border/40">
        <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest">
          Displaying {table.getRowModel().rows.length} of {data.length} records
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-xl h-8 border-border/40 hover:bg-background transition-all font-semibold px-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-xl h-8 border-border/40 hover:bg-background transition-all font-semibold px-3"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
