"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useLinkProduct, useSuppliers } from "@/hooks/use-suppliers";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

const linkSupplierSchema = z.object({
  supplier_id: z.coerce.number().min(1, "Supplier is required"),
  supplier_sku: z.string().optional(),
  cost_price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  est_delivery_days: z.coerce.number().min(1, "Must be at least 1 day"),
  min_order_qty: z.coerce.number().min(1, "Must be at least 1").optional(),
  is_preferred: z.boolean().default(false),
});

type LinkSupplierFormValues = z.infer<typeof linkSupplierSchema>;

interface LinkSupplierModalProps {
  productId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LinkSupplierModal({ productId, open, onOpenChange }: LinkSupplierModalProps) {
  const linkMutation = useLinkProduct();

  // Fetch suppliers
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useSuppliers();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LinkSupplierFormValues>({
    resolver: zodResolver(linkSupplierSchema) as any,
    defaultValues: {
      supplier_id: 0,
      supplier_sku: "",
      cost_price: "",
      est_delivery_days: 1,
      min_order_qty: 1,
      is_preferred: false,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (values: LinkSupplierFormValues) => {
    try {
      const { supplier_id, ...data } = values;
      await linkMutation.mutateAsync({
        supplierId: supplier_id,
        data: {
          ...data,
          product_id: productId,
        },
      });
      onOpenChange(false);
    } catch (err) {
      // Errors handled by mutation hook via toast
    }
  };

  const suppliers = suppliersData?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit as any)}>
          <DialogHeader>
            <DialogTitle>Link Supplier to Product</DialogTitle>
            <DialogDescription>
              Associate a vendor with this product and define procurement details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="supplier_id">Supplier *</Label>
              <Controller
                name="supplier_id"
                control={control}
                render={({ field }) => (
                  <Combobox 
                    value={field.value ? field.value.toString() : ""} 
                    onValueChange={(val) => val && field.onChange(parseInt(val))}
                  >
                    <ComboboxInput 
                      placeholder={isLoadingSuppliers ? "Loading suppliers..." : "Search suppliers..."} 
                      disabled={isLoadingSuppliers}
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>No supplier found.</ComboboxEmpty>
                      <ComboboxList>
                        {suppliers.map((supplier) => (
                          <ComboboxItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                )}
              />
              {errors.supplier_id && (
                <p className="text-xs text-destructive">{errors.supplier_id.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="supplier_sku">Supplier SKU (Optional)</Label>
              <Input
                id="supplier_sku"
                {...register("supplier_sku")}
                placeholder="Vendor's internal code"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="cost_price">Cost Price *</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  {...register("cost_price")}
                  placeholder="0.00"
                />
                {errors.cost_price && (
                  <p className="text-xs text-destructive">{errors.cost_price.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="est_delivery_days">Lead Time (Days) *</Label>
                <Input
                  id="est_delivery_days"
                  type="number"
                  {...register("est_delivery_days")}
                  placeholder="e.g. 5"
                />
                {errors.est_delivery_days && (
                  <p className="text-xs text-destructive">{errors.est_delivery_days.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="min_order_qty">Min Order Qty</Label>
                <Input
                  id="min_order_qty"
                  type="number"
                  {...register("min_order_qty")}
                  placeholder="1"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Controller
                  name="is_preferred"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="is_preferred"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="is_preferred" className="cursor-pointer">
                  Preferred Supplier
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingSuppliers}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Link Supplier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
