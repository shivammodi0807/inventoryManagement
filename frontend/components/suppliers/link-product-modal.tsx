"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useLinkProduct } from "@/hooks/use-suppliers";
import { getProducts } from "@/lib/inventory";
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
import { Product } from "@/types/inventory";

const linkProductSchema = z.object({
  product_id: z.coerce.number().min(1, "Product is required"),
  supplier_sku: z.string().optional(),
  cost_price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  est_delivery_days: z.coerce.number().min(1, "Must be at least 1 day"),
  min_order_qty: z.coerce.number().min(1, "Must be at least 1").optional(),
  is_preferred: z.boolean().default(false),
});

type LinkProductFormValues = z.infer<typeof linkProductSchema>;

interface LinkProductModalProps {
  supplierId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LinkProductModal({ supplierId, open, onOpenChange }: LinkProductModalProps) {
  // Fetch products at top level to keep them cached even when modal is closed
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => getProducts({ per_page: 100 }),
    enabled: open, // Only fetch when modal is open or about to open
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {open && (
          <LinkProductForm 
            supplierId={supplierId} 
            products={productsData?.data || []}
            isLoadingProducts={isLoadingProducts}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface LinkProductFormProps {
  supplierId: number;
  products: Product[];
  isLoadingProducts: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

function LinkProductForm({ supplierId, products: allProducts, isLoadingProducts, onCancel, onSuccess }: LinkProductFormProps) {
  const linkMutation = useLinkProduct();
  const [search, setSearch] = React.useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LinkProductFormValues>({
    resolver: zodResolver(linkProductSchema),
    defaultValues: {
      product_id: 0,
      supplier_sku: "",
      cost_price: "",
      est_delivery_days: 1,
      min_order_qty: 1,
      is_preferred: false,
    },
  });

  const products = allProducts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const onSubmit = async (values: LinkProductFormValues) => {
    try {
      await linkMutation.mutateAsync({
        supplierId,
        data: values,
      });
      onSuccess();
    } catch {
      // Errors handled by mutation hook via toast
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>Link Product to Supplier</DialogTitle>
        <DialogDescription>
          Add a product from your inventory to this supplier&apos;s catalog.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="product_id">Product *</Label>
          <Controller
            name="product_id"
            control={control}
            render={({ field }) => (
              <Combobox 
                value={field.value ? field.value.toString() : ""} 
                onValueChange={(val) => {
                  if (val) {
                    field.onChange(parseInt(val));
                    const selected = products.find(p => p.id.toString() === val);
                    if (selected) setSearch(selected.name);
                  }
                }}
              >
                <ComboboxInput 
                  placeholder={isLoadingProducts ? "Loading products..." : "Search products..."} 
                  disabled={isLoadingProducts}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <ComboboxContent>
                  <ComboboxEmpty>No product found.</ComboboxEmpty>
                  <ComboboxList>
                    {products.map((product) => (
                      <ComboboxItem key={product.id} value={product.id.toString()}>
                        {product.name} ({product.sku})
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          />
          {errors.product_id && (
            <p className="text-xs text-destructive">{errors.product_id.message}</p>
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
                  onCheckedChange={(checked) => field.onChange(checked)}
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoadingProducts}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Link Product
        </Button>
      </DialogFooter>
    </form>
  );
}
