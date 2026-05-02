"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ArrowLeft, Loader2, Plus, Trash2, CalendarIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useCreatePurchaseOrder } from "@/hooks/use-purchase-orders";
import { useSuppliers } from "@/hooks/use-suppliers";
import { getProducts } from "@/lib/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

const poSchema = z.object({
  supplier_id: z.coerce.number().min(1, "Supplier is required"),
  order_date: z.string().min(1, "Order date is required"),
  exp_delivery: z.string().optional(),
  description: z.string().max(1000).optional(),
  items: z.array(
    z.object({
      product_id: z.coerce.number().min(1, "Product is required"),
      qty_ordered: z.coerce.number().min(1, "Must be at least 1"),
      cost_price: z.coerce.number().min(0, "Must be positive"),
    })
  ).min(1, "At least one item is required"),
});

type POFormValues = z.infer<typeof poSchema>;

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const createMutation = useCreatePurchaseOrder();

  // Fetch lists
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useSuppliers({ per_page: 100 });
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => getProducts({ per_page: 100 }), // In a real app, use async select
  });

  const suppliers = suppliersData?.data || [];
  const products = productsData?.data || [];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<POFormValues>({
    resolver: zodResolver(poSchema) as any,
    defaultValues: {
      supplier_id: 0,
      order_date: format(new Date(), "yyyy-MM-dd"),
      exp_delivery: "",
      description: "",
      items: [{ product_id: 0, qty_ordered: 1, cost_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");

  const calculateTotal = () => {
    return watchItems.reduce((acc, item) => {
      const qty = Number(item.qty_ordered) || 0;
      const cost = Number(item.cost_price) || 0;
      return acc + qty * cost;
    }, 0);
  };

  const onSubmit = async (values: POFormValues) => {
    try {
      const res = await createMutation.mutateAsync({
        ...values,
        exp_delivery: values.exp_delivery || null, // convert empty string to null
      });
      router.push(`/dashboard/purchase-orders/${res.data.id}`);
    } catch (err) {
      // toast handled in mutation
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Purchase Order</h1>
          <p className="text-muted-foreground mt-1">
            Draft a new purchase order to send to a supplier.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)}>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>Add the products you wish to order.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[250px]">Product</TableHead>
                        <TableHead className="w-[120px] text-right">Quantity</TableHead>
                        <TableHead className="w-[150px] text-right">Unit Cost ($)</TableHead>
                        <TableHead className="w-[120px] text-right">Total</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => {
                        const qty = watchItems[index]?.qty_ordered || 0;
                        const cost = watchItems[index]?.cost_price || 0;
                        const total = qty * cost;

                        return (
                          <TableRow key={field.id}>
                            <TableCell>
                              <Controller
                                name={`items.${index}.product_id`}
                                control={control}
                                render={({ field: selectField }) => (
                                  <Combobox
                                    value={selectField.value ? selectField.value.toString() : ""}
                                    onValueChange={(val) => {
                                      if(!val) return;
                                      const prodId = parseInt(val);
                                      selectField.onChange(prodId);
                                      // Auto-fill cost price from product if available
                                      const product = products.find(p => p.id === prodId);
                                      if (product) {
                                        setValue(`items.${index}.cost_price`, parseFloat(product.cost_price?.toString() || "0"));
                                      }
                                    }}
                                  >
                                    <ComboboxInput 
                                      placeholder={isLoadingProducts ? "Loading..." : "Select product"} 
                                      disabled={isLoadingProducts}
                                    />
                                    <ComboboxContent>
                                      <ComboboxEmpty>No product found.</ComboboxEmpty>
                                      <ComboboxList>
                                        {products.map((p) => (
                                          <ComboboxItem key={p.id} value={p.id.toString()}>
                                            {p.name} ({p.sku})
                                          </ComboboxItem>
                                        ))}
                                      </ComboboxList>
                                    </ComboboxContent>
                                  </Combobox>
                                )}
                              />
                              {errors.items?.[index]?.product_id && (
                                <p className="text-[10px] text-destructive mt-1">
                                  {errors.items[index]?.product_id?.message}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                className="text-right"
                                {...register(`items.${index}.qty_ordered`)}
                              />
                              {errors.items?.[index]?.qty_ordered && (
                                <p className="text-[10px] text-destructive mt-1">
                                  {errors.items[index]?.qty_ordered?.message}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                className="text-right"
                                {...register(`items.${index}.cost_price`)}
                              />
                              {errors.items?.[index]?.cost_price && (
                                <p className="text-[10px] text-destructive mt-1">
                                  {errors.items[index]?.cost_price?.message}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${total.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                disabled={fields.length === 1}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {errors.items?.root && (
                  <p className="text-sm text-destructive mt-2">{errors.items.root.message}</p>
                )}
                
                <div className="mt-4 flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ product_id: 0, qty_ordered: 1, cost_price: 0 })}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Line Item
                  </Button>
                  
                  <div className="text-right">
                    <span className="text-muted-foreground mr-4">Total Amount:</span>
                    <span className="text-xl font-bold">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>Supplier and scheduling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_id">Supplier *</Label>
                  <Controller
                    name="supplier_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? field.value.toString() : ""}
                        onValueChange={(val) => field.onChange(parseInt(val))}
                        disabled={isLoadingSuppliers}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.supplier_id && (
                    <p className="text-xs text-destructive">{errors.supplier_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order_date">Order Date *</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="order_date"
                      type="date"
                      className="pl-9"
                      {...register("order_date")}
                    />
                  </div>
                  {errors.order_date && (
                    <p className="text-xs text-destructive">{errors.order_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exp_delivery">Expected Delivery Date</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="exp_delivery"
                      type="date"
                      className="pl-9"
                      {...register("exp_delivery")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Notes / Instructions</Label>
                  <Textarea
                    id="description"
                    placeholder="Any special instructions for the supplier..."
                    {...register("description")}
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save as Draft
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
