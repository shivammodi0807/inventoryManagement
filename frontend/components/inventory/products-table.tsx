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
import {
  MoreHorizontal,
  Pencil,
  History,
  Trash2,
  PackagePlus,
  ImageIcon,
  ExternalLink
} from "lucide-react";
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
import { cn } from "@/lib/utils";

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
  onSelectionChange,
}: ProductsTableProps) {
  const { can } = useAuth();
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedImage, setSelectedImage] = React.useState<{
    url: string;
    name: string;
  } | null>(null);

  const columns = React.useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="px-1">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
              className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "product",
        header: "Product Intelligence",
        cell: ({ row }) => {
          const imageUrl = row.original.image_url;
          return (
            <div className="flex items-center gap-4">
              <div
                className="group relative h-14 w-14 shrink-0 cursor-zoom-in overflow-hidden rounded-2xl border border-border/40 bg-secondary/30 transition-all hover:ring-2 hover:ring-primary/20 shadow-sm"
                onClick={() =>
                  imageUrl &&
                  setSelectedImage({ url: imageUrl, name: row.original.name })
                }
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={row.original.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <PackagePlus className="h-6 w-6 text-muted-foreground/20" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semiboldbold text-foreground text-base tracking-tight leading-none">{row.original.name}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest bg-secondary/50 px-1.5 py-0.5 rounded">
                    {row.original.sku}
                  </span>
                  <span className="text-[10px] font-semibold text-primary/60 uppercase tracking-widest">
                    ID-{row.original.id}
                  </span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Taxonomy",
        cell: ({ row }) => (
          <Badge className="font-semibold bg-primary/5 text-primary border-primary/10 shadow-none text-[10px] uppercase tracking-wider px-2 py-0.5">
            {row.original.category?.name ?? "General"}
          </Badge>
        ),
      },
      {
        accessorKey: "unit_price",
        header: () => <div className="text-right">Valuation</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("unit_price"));
          return (
            <div className="flex flex-col items-end">
              <span className="font-semibold text-foreground tabular-nums text-base">
                ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground/40 tracking-widest uppercase">Per Unit</span>
            </div>
          );
        },
      },
      {
        accessorKey: "total_stock",
        header: () => <div className="text-right">Liquidity</div>,
        cell: ({ row }) => {
          const stock = row.getValue("total_stock") as number ?? 0;
          const reorderPoint = row.original.reorder_point || 0;
          return (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "font-semibold tabular-nums text-lg leading-none",
                  stock <= reorderPoint ? "text-destructive" : "text-foreground"
                )}>
                  {stock.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tighter">Qty</span>
              </div>
              <div className="h-1 w-16 bg-secondary rounded-full mt-1.5 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", stock <= reorderPoint ? "bg-destructive" : "bg-primary")}
                  style={{ width: `${Math.min((stock / (reorderPoint * 2 || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "stock_status",
        header: "Inventory Health",
        cell: ({ row }) => {
          const status = row.original.stock_status || "normal";

          const statusConfig: Record<string, { label: string; className: string }> = {
            critical: { label: "Critical", className: "bg-destructive/10 text-destructive border-destructive/20" },
            low: { label: "Low Supply", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
            normal: { label: "Healthy", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
            overstock: { label: "Overstocked", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
          };

          const config = statusConfig[status] || statusConfig.normal;

          return (
            <Badge className={cn("px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1.5 border shadow-none", config.className)}>
              <span className={cn("h-1.5 w-1.5 rounded-full",
                status === 'critical' ? 'bg-destructive animate-pulse' :
                  status === 'low' ? 'bg-amber-500' :
                    'bg-emerald-500'
              )} />
              {config.label}
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
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl border-border/40 shadow-premium p-1">
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 py-1.5">Operations</DropdownMenuLabel>
                  <DropdownMenuItem asChild className="rounded-lg font-semibold cursor-pointer">
                    <Link href={`/dashboard/inventory/products/${product.id}`} className="flex items-center">
                      <ExternalLink className="mr-2 h-4 w-4 text-primary/60" />
                      Digital Identity
                    </Link>
                  </DropdownMenuItem>
                  {meta?.can?.("edit", "product") && (
                    <>
                      <DropdownMenuItem asChild className="rounded-lg font-semibold cursor-pointer">
                        <Link
                          href={`/dashboard/inventory/products/${product.id}/edit`}
                          className="flex items-center"
                        >
                          <Pencil className="mr-2 h-4 w-4 text-primary/60" />
                          Modify Parameters
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => meta?.onAdjustStock?.(product)}
                        className="rounded-lg font-semibold cursor-pointer"
                      >
                        <PackagePlus className="mr-2 h-4 w-4 text-primary/60" />
                        Reconcile Stock
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem className="rounded-lg font-semibold cursor-pointer">
                    <History className="mr-2 h-4 w-4 text-primary/60" />
                    Chain of Custody
                  </DropdownMenuItem>
                  {meta?.can?.("delete", "product") && (
                    <>
                      <DropdownMenuSeparator className="bg-border/40" />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive rounded-lg font-semibold cursor-pointer"
                        onClick={() => meta?.onDelete?.(product)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Decommission
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    []
  );

  const tableMeta = React.useMemo(
    () => ({
      onDelete,
      onAdjustStock,
      can,
    }),
    [onDelete, onAdjustStock, can],
  );

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
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);
    onSelectionChange?.(selectedIds);
  }, [rowSelection, table, onSelectionChange]);

  return (
    <div className="premium-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-secondary/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-12 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80 py-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
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
                  className="group hover:bg-secondary/40 transition-colors border-b border-border/40 last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="h-8 w-8 opacity-20" />
                    <p className="font-medium">No products found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        <DialogContent className="max-w-3xl overflow-hidden p-0 bg-transparent border-none shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedImage?.name}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden glass border border-white/20">
              <Image
                src={selectedImage.url}
                alt={selectedImage.name}
                fill
                className="object-contain p-4"
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
