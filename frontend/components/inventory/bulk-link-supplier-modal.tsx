"use client";

import * as React from "react";
import { useForm, Controller, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { useSuppliers, useLinkProduct } from "@/hooks/use-suppliers";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Supplier } from "@/types";

const bulkLinkSchema = z.object({
  supplier_id: z.number().min(1, "Supplier is required"),
  est_delivery_days: z.number().min(1, "Must be at least 1 day"),
  min_order_qty: z.number().min(1, "Must be at least 1").optional(),
  is_preferred: z.boolean().default(false),
});

type BulkLinkFormValues = z.infer<typeof bulkLinkSchema>;

interface BulkLinkSupplierModalProps {
  productIds: number[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BulkLinkSupplierModal({
  productIds,
  open,
  onOpenChange,
  onSuccess,
}: BulkLinkSupplierModalProps) {
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useSuppliers();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        {open && (
          <BulkLinkForm
            productIds={productIds}
            suppliers={suppliersData?.data || []}
            isLoadingSuppliers={isLoadingSuppliers}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => {
              onOpenChange(false);
              onSuccess?.();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface BulkLinkFormProps {
  productIds: number[];
  suppliers: Supplier[];
  isLoadingSuppliers: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

function BulkLinkForm({
  productIds,
  suppliers,
  isLoadingSuppliers,
  onCancel,
  onSuccess,
}: BulkLinkFormProps) {
  const linkMutation = useLinkProduct();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BulkLinkFormValues>({
    resolver: zodResolver(bulkLinkSchema) as Resolver<BulkLinkFormValues>,
    defaultValues: {
      supplier_id: 0,
      est_delivery_days: 7,
      min_order_qty: 1,
      is_preferred: false,
    },
  });

  const onSubmit: SubmitHandler<BulkLinkFormValues> = async (values) => {
    setIsProcessing(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < productIds.length; i++) {
      try {
        await linkMutation.mutateAsync({
          supplierId: values.supplier_id,
          data: {
            product_id: productIds[i],
            est_delivery_days: values.est_delivery_days,
            min_order_qty: values.min_order_qty,
            is_preferred: values.is_preferred,
            cost_price: "0.00",
          },
        });
        successCount++;
      } catch {
        failCount++;
      }
      setProgress(Math.round(((i + 1) / productIds.length) * 100));
    }

    setIsProcessing(false);
    if (failCount === 0) {
      toast.success(
        `Successfully linked ${successCount} products to the supplier.`,
      );
      onSuccess();
    } else {
      toast.error(`Linked ${successCount} products, but ${failCount} failed.`);
      if (successCount > 0) onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>Bulk Link to Supplier</DialogTitle>
        <DialogDescription>
          Associate {productIds.length} selected products with a single
          supplier.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <Alert
          variant="default"
          className="bg-amber-50 border-amber-200 text-amber-800"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Note</AlertTitle>
          <AlertDescription className="text-xs">
            Cost prices will be set to 0.00. You can update individual costs in
            the product or supplier details page later.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-2">
          <Label htmlFor="supplier_id">Target Supplier *</Label>
          <Controller
            name="supplier_id"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ? field.value.toString() : ""}
                onValueChange={(val) => val && field.onChange(parseInt(val))}
              >
                <ComboboxInput
                  placeholder={
                    isLoadingSuppliers
                      ? "Loading suppliers..."
                      : "Search suppliers..."
                  }
                  disabled={isLoadingSuppliers || isProcessing}
                />
                <ComboboxContent>
                  <ComboboxEmpty>No supplier found.</ComboboxEmpty>
                  <ComboboxList>
                    {suppliers.map((supplier) => (
                      <ComboboxItem
                        key={supplier.id}
                        value={supplier.id.toString()}
                      >
                        {supplier.name}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          />
          {errors.supplier_id && (
            <p className="text-xs text-destructive">
              {errors.supplier_id.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="est_delivery_days">Common Lead Time (Days)</Label>
            <Input
              id="est_delivery_days"
              type="number"
              disabled={isProcessing}
              {...register("est_delivery_days", { valueAsNumber: true })}
              placeholder="e.g. 7"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="min_order_qty">Common Min Qty</Label>
            <Input
              id="min_order_qty"
              type="number"
              disabled={isProcessing}
              {...register("min_order_qty", { valueAsNumber: true })}
              placeholder="1"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Controller
            name="is_preferred"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="is_preferred"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked)}
                disabled={isProcessing}
              />
            )}
          />
          <Label htmlFor="is_preferred" className="cursor-pointer">
            Set as Preferred Supplier for all
          </Label>
        </div>

        {isProcessing && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Processing...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isProcessing || isLoadingSuppliers}>
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Link {productIds.length} Products
        </Button>
      </DialogFooter>
    </form>
  );
}
