"use client";

import * as React from "react";
import Link from "next/link";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Pencil, History, Trash2, PackagePlus } from "lucide-react";

import { Product } from "@/types/inventory";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/hooks/use-auth";

interface ProductsTableProps {
  data: Product[];
  isLoading?: boolean;
  onDelete?: (id: number) => void;
  onAdjustStock?: (product: Product) => void;
}

export function ProductsTable({ 
  data, 
  isLoading, 
  onDelete, 
  onAdjustStock 
}: ProductsTableProps) {
  const { can } = useAuth();

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("sku")}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div>{row.original.category?.name ?? "Uncategorized"}</div>,
    },
    {
      accessorKey: "unit_price",
      header: "Price",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("unit_price"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "total_stock",
      header: "Stock",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("total_stock") ?? 0}</div>
      ),
    },
    {
      accessorKey: "stock_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.stock_status || "normal";
        const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
          critical: "destructive",
          low: "secondary",
          normal: "outline",
          overstock: "default",
        };
        
        return (
          <Badge variant={variants[status] || "outline"} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/inventory/products/${product.id}`}>
                  <History className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              {can("edit", "product") && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/inventory/products/${product.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Product
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAdjustStock?.(product)}>
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Adjust Stock
                  </DropdownMenuItem>
                </>
              )}
              {can("delete", "product") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => onDelete?.(product.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Product
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
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
