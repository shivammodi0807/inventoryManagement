"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { useReceivePurchaseOrder } from "@/hooks/use-purchase-orders";
import { useWarehouses } from "@/hooks/use-warehouses";
import { PurchaseOrder } from "@/types/purchase-order";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const receiveSchema = z.object({
  warehouse_id: z.coerce.number().min(1, "Warehouse is required"),
  items: z.array(
    z.object({
      item_id: z.coerce.number(),
      qty_ordered: z.coerce.number(),
      qty_received_previously: z.coerce.number(),
      qty_received: z.coerce.number().min(0, "Cannot be negative"),
      product_name: z.string(),
      product_sku: z.string(),
    })
  ).refine(items => items.some(item => item.qty_received > 0), {
    message: "You must receive at least 1 item across all lines",
    path: ["items"]
  })
});

type ReceiveFormValues = z.infer<typeof receiveSchema>;

interface ReceivePOModalProps {
  order: PurchaseOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceivePOModal({ order, open, onOpenChange }: ReceivePOModalProps) {
  const receiveMutation = useReceivePurchaseOrder();
  const { data: warehouses, isLoading: isLoadingWarehouses } = useWarehouses(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReceiveFormValues>({
    resolver: zodResolver(receiveSchema) as any,
    defaultValues: {
      warehouse_id: 0,
      items: [],
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "items",
  });

  React.useEffect(() => {
    if (open && order) {
      // Initialize form with items
      const itemsToReceive = order.items?.map(item => ({
        item_id: item.id,
        qty_ordered: item.qty_ordered,
        qty_received_previously: item.qty_received,
        qty_received: Math.max(0, item.qty_ordered - item.qty_received), // default to receiving the remaining amount
        product_name: item.product?.name || "Unknown Product",
        product_sku: item.product?.sku || "",
      })) || [];

      reset({
        warehouse_id: warehouses?.[0]?.id || 0,
        items: itemsToReceive,
      });
    }
  }, [open, order, reset, warehouses]);

  const onSubmit = async (values: ReceiveFormValues) => {
    if (!order) return;
    try {
      // Filter out items with 0 qty received
      const validItems = values.items
        .filter(item => item.qty_received > 0)
        .map(item => ({
          item_id: item.item_id,
          qty_received: item.qty_received
        }));

      await receiveMutation.mutateAsync({
        id: order.id,
        data: {
          warehouse_id: values.warehouse_id,
          items: validItems
        }
      });
      onOpenChange(false);
    } catch (err) {
      // Handled by mutation toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit(onSubmit as any)}>
          <DialogHeader>
            <DialogTitle>Receive Purchase Order: {order?.po_number}</DialogTitle>
            <DialogDescription>
              Record stock received into a warehouse. You can receive partial quantities.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="warehouse_id">Destination Warehouse *</Label>
              <Controller
                name="warehouse_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? field.value.toString() : ""}
                    onValueChange={(val) => field.onChange(parseInt(val))}
                    disabled={isLoadingWarehouses}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses?.map((w) => (
                        <SelectItem key={w.id} value={w.id.toString()}>
                          {w.name} {w.location ? `(${w.location})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.warehouse_id && (
                <p className="text-xs text-destructive">{errors.warehouse_id.message}</p>
              )}
            </div>

            <div className="mt-4 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Ordered</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right w-[150px]">To Receive</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <div className="font-medium">{field.product_name}</div>
                        <div className="text-xs text-muted-foreground">{field.product_sku}</div>
                      </TableCell>
                      <TableCell className="text-right">{field.qty_ordered}</TableCell>
                      <TableCell className="text-right">{field.qty_received_previously}</TableCell>
                      <TableCell className="text-right">
                        <Controller
                          name={`items.${index}.qty_received`}
                          control={control}
                          render={({ field: inputField }) => (
                            <Input
                              type="number"
                              className="text-right h-8"
                              {...inputField}
                            />
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {errors.items?.root && (
              <p className="text-sm text-destructive">{errors.items.root.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingWarehouses}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Receive Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
