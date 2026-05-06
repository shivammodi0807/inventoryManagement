"use client";

import * as React from "react";
import Link from "next/link";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowData,
} from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    onDelete?: (data: TData) => void;
    onAdjustStock?: (product: TData) => void;
    can?: (action: string, subject: string) => boolean;
  }
}
import { MoreHorizontal, Pencil, History, Trash2, PackagePlus, ImageIcon } from "lucide-react";
import Image from "next/image";

import { Product } from "@/types/inventory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";

interface ProductsTableProps {
  data: Product[];
  onDelete?: (product: Product) => void;
  onAdjustStock?: (product: Product) => void;
  onSelectionChange?: (selectedIds: number[]) => void;
}

export function ProductsTable({ 
  data, 
  onDelete, 
  onAdjustStock,
  onSelectionChange
}: ProductsTableProps) {
  const { can } = useAuth();
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedImage, setSelectedImage] = React.useState<{ url: string; name: string } | null>(null);

  const columns = React.useMemo<ColumnDef<Product>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "image",
      header: "Image",
      cell: ({ row }) => {
        const imageUrl = row.original.image_url;
        return (
          <div 
            className="relative h-10 w-10 cursor-zoom-in overflow-hidden rounded border bg-muted transition-transform hover:scale-105"
            onClick={() => imageUrl && setSelectedImage({ url: imageUrl, name: row.original.name })}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={row.original.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      },
    },
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
      cell: ({ row, table }) => {
        const product = row.original;
        const meta = table.options.meta;

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
              {meta?.can?.("edit", "product") && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/inventory/products/${product.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Product
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.onAdjustStock?.(product)}>
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Adjust Stock
                  </DropdownMenuItem>
                </>
              )}
              {meta?.can?.("delete", "product") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => meta?.onDelete?.(product)}
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
  ], []);

  const tableMeta = React.useMemo(() => ({
    onDelete,
    onAdjustStock,
    can,
  }), [onDelete, onAdjustStock, can]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(),
    meta: tableMeta,
  });

  React.useEffect(() => {
    const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.id);
    onSelectionChange?.(selectedIds);
  }, [rowSelection, table, onSelectionChange]);

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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedImage?.name}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative aspect-square w-full">
              <Image
                src={selectedImage.url}
                alt={selectedImage.name}
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
