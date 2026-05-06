"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Warehouse as WarehouseIcon } from "lucide-react";
import { isAxiosError } from "axios";

import { Product } from "@/types/inventory";
import { adjustStock } from "@/lib/inventory";
import { useWarehouses } from "@/hooks/use-warehouses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ApiError } from "@/types";
import { Warehouse } from "@/types/warehouse";

const schema = z.object({
  warehouse_id: z.coerce.number().min(1, "Please select a warehouse"),
  quantity: z.coerce.number().refine((n) => n !== 0, "Quantity cannot be zero"),
  type: z.string().min(1, "Adjustment type is required"),
  notes: z.string().optional(),
});

type Values = z.infer<typeof schema>;

interface StockAdjustModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StockAdjustModal({ product, isOpen, onClose }: StockAdjustModalProps) {
  // Fetch active warehouses for the dropdown
  const { data: warehouses = [], isLoading: isLoadingWarehouses } = useWarehouses(true);

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        {isOpen && (
          <StockAdjustForm 
            product={product} 
            warehouses={warehouses} 
            isLoadingWarehouses={isLoadingWarehouses} 
            onClose={onClose} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface StockAdjustFormProps {
  product: Product;
  warehouses: Warehouse[];
  isLoadingWarehouses: boolean;
  onClose: () => void;
}

function StockAdjustForm({ product, warehouses, isLoadingWarehouses, onClose }: StockAdjustFormProps) {
  const queryClient = useQueryClient();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      warehouse_id: warehouses.length > 0 ? warehouses[0].id : 0,
      quantity: 0,
      type: "adjustment",
      notes: "",
    },
  });

  const warehouseId = useWatch({ control, name: "warehouse_id" });

  const mutation = useMutation({
    mutationFn: (values: Values) => adjustStock(product.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", product.id] });
      queryClient.invalidateQueries({ queryKey: ["product-history", product.id] });
      toast.success("Stock level updated");
      onClose();
    },
    onError: (err) => {
      if (isAxiosError<ApiError>(err)) {
        toast.error(err.response?.data?.message || "Adjustment failed");
      } else {
        toast.error("Unexpected error");
      }
    },
  });

  const onSubmit = (values: Values) => mutation.mutate(values);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Adjust Stock</DialogTitle>
        <DialogDescription>
          Record a stock change for <strong>{product.name}</strong>.
        </DialogDescription>
      </DialogHeader>

      <FieldGroup className="py-4">
        {/* Warehouse selector */}
        <Field>
          <FieldLabel>Warehouse</FieldLabel>
          {isLoadingWarehouses ? (
            <Skeleton className="h-10 w-full" />
          ) : warehouses.length === 0 ? (
            <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              <WarehouseIcon className="h-4 w-4" />
              <span>No active warehouses. <a href="/dashboard/warehouses" className="underline">Create one first.</a></span>
            </div>
          ) : (
            <Select
              value={warehouseId ? warehouseId.toString() : ""}
              onValueChange={(v) => setValue("warehouse_id", parseInt(v))}
            >
              <SelectTrigger id="adjust-warehouse">
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id.toString()}>
                    <span className="font-medium">{w.name}</span>
                    {w.location && (
                      <span className="ml-2 text-xs text-muted-foreground">{w.location}</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <FieldError errors={[errors.warehouse_id]} />
        </Field>

        <Field>
          <FieldLabel>Type</FieldLabel>
          <Select
            defaultValue="adjustment"
            onValueChange={(v) => setValue("type", v)}
          >
            <SelectTrigger id="adjust-type">
              <SelectValue placeholder="Reason for change" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adjustment">Manual Adjustment</SelectItem>
              <SelectItem value="sale">Sale / Removal</SelectItem>
              <SelectItem value="damage">Damage / Loss</SelectItem>
              <SelectItem value="return">Customer Return</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
          <FieldError errors={[errors.type]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="adjust-quantity">Quantity Change</FieldLabel>
          <Input
            id="adjust-quantity"
            type="number"
            {...register("quantity")}
            placeholder="e.g. +10 or -5"
          />
          <FieldError errors={[errors.quantity]} />
          <p className="text-[0.8rem] text-muted-foreground">
            Positive to add stock, negative to remove.
          </p>
        </Field>

        <Field>
          <FieldLabel htmlFor="adjust-notes">Notes</FieldLabel>
          <Textarea
            id="adjust-notes"
            {...register("notes")}
            placeholder="Why is this adjustment being made?"
          />
          <FieldError errors={[errors.notes]} />
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending || isLoadingWarehouses || warehouses.length === 0}
        >
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirm Adjustment
        </Button>
      </DialogFooter>
    </form>
  );
}
