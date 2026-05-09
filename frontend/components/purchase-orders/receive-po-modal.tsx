"use client";
import { useForm, useFieldArray, Controller, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { useReceivePurchaseOrder } from "@/hooks/use-purchase-orders";
import { useWarehouses } from "@/hooks/use-warehouses";
import { PurchaseOrder } from "@/types/purchase-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReceiveItem {
  id: string;
  product_name: string;
  product_sku: string;
  qty_ordered: number;
  qty_received_previously: number;
  qty_received: number;
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Warehouse } from "@/types";

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
  const { data: warehouses, isLoading: isLoadingWarehouses } = useWarehouses(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        {open && order && (
          <ReceivePOForm
            order={order}
            warehouses={warehouses || []}
            isLoadingWarehouses={isLoadingWarehouses}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ReceivePOFormProps {
  order: PurchaseOrder;
  warehouses: Warehouse[];
  isLoadingWarehouses: boolean;
  onClose: () => void;
}

function ReceivePOForm({ order, warehouses, isLoadingWarehouses, onClose }: ReceivePOFormProps) {
  const receiveMutation = useReceivePurchaseOrder();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(receiveSchema),
    defaultValues: {
      warehouse_id: warehouses[0]?.id || 0,
      items: order.items?.map(item => ({
        item_id: item.id,
        qty_ordered: item.qty_ordered,
        qty_received_previously: item.qty_received,
        qty_received: Math.max(0, item.qty_ordered - item.qty_received),
        product_name: item.product?.name || "Unknown Product",
        product_sku: item.product?.sku || "",
      })) || [],
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: FieldValues) => {
    const values = data as ReceiveFormValues;
    try {
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
      onClose();
    } catch {
      // Handled by mutation toast
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>Receive Purchase Order: {order.po_number}</DialogTitle>
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
                  {warehouses.map((w) => (
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

        <div className="mt-4 border rounded-md bg-card">
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
              {fields.map((field, index) => {
                const item = field as unknown as ReceiveItem;
                return (
                  <TableRow key={field.id}>
                    <TableCell>
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-xs text-muted-foreground">{item.product_sku}</div>
                    </TableCell>
                    <TableCell className="text-right">{item.qty_ordered}</TableCell>
                    <TableCell className="text-right">{item.qty_received_previously}</TableCell>
                    <TableCell className="text-right">
                      <Controller
                        name={`items.${index}.qty_received`}
                        control={control}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        render={({ field: inputField }: any) => (
                          <Input
                            type="number"
                            className="text-right h-8"
                            {...inputField}
                          />
                        )}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {errors.items?.root && (
          <p className="text-sm text-destructive">{errors.items.root.message}</p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoadingWarehouses}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Receive Stock
        </Button>
      </DialogFooter>
    </form>
  );
}
