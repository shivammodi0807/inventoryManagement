"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomers } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useCreateSalesOrder } from "@/hooks/use-sales-orders";
import { Separator } from "@/components/ui/separator";

const salesOrderSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  order_date: z.string().min(1, "Date is required"),
  shipping_address: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().min(1, "Product is required"),
    warehouse_id: z.string().min(1, "Warehouse is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    unit_price: z.coerce.number().min(0, "Price cannot be negative"),
  })).min(1, "At least one item is required"),
});

type SalesOrderFormValues = z.infer<typeof salesOrderSchema>;

export default function CreateSalesOrderPage() {
  const router = useRouter();
  const createMutation = useCreateSalesOrder();
  
  const { data: customers } = useCustomers({ is_active: true });
  const { data: products } = useProducts();
  const { data: warehouses } = useWarehouses();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      customer_id: "",
      order_date: new Date().toISOString().split("T")[0],
      items: [{ product_id: "", warehouse_id: "", quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = handleSubmit(async (values: SalesOrderFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      router.push("/dashboard/sales/orders");
    } catch (error) {
      // Error handled in hook
    }
  });

  const watchItems = watch("items");
  const subtotal = watchItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  const customerId = watch("customer_id");

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Sales Order</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field data-invalid={!!errors.customer_id}>
                <FieldLabel htmlFor="customer_id">Customer</FieldLabel>
                <Select 
                  onValueChange={(v) => setValue("customer_id", v)} 
                  value={customerId}
                >
                  <SelectTrigger id="customer_id">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.data?.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.customer_id]} />
              </Field>

              <Field data-invalid={!!errors.order_date}>
                <FieldLabel htmlFor="order_date">Order Date</FieldLabel>
                <Input type="date" id="order_date" {...register("order_date")} />
                <FieldError errors={[errors.order_date]} />
              </Field>

              <Field data-invalid={!!errors.shipping_address} className="md:col-span-2">
                <FieldLabel htmlFor="shipping_address">Shipping Address</FieldLabel>
                <Input id="shipping_address" placeholder="Enter delivery address" {...register("shipping_address")} />
                <FieldError errors={[errors.shipping_address]} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Items</CardTitle>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => append({ product_id: "", warehouse_id: "", quantity: 1, unit_price: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start border p-4 rounded-lg relative">
                <FieldGroup className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                  <Field data-invalid={!!errors.items?.[index]?.product_id}>
                    <FieldLabel>Product</FieldLabel>
                    <Select 
                      onValueChange={(v) => setValue(`items.${index}.product_id`, v)} 
                      defaultValue={field.product_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.data?.map((p: any) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[errors.items?.[index]?.product_id]} />
                  </Field>

                  <Field data-invalid={!!errors.items?.[index]?.warehouse_id}>
                    <FieldLabel>Warehouse</FieldLabel>
                    <Select 
                      onValueChange={(v) => setValue(`items.${index}.warehouse_id`, v)} 
                      defaultValue={field.warehouse_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses?.map((w: any) => (
                          <SelectItem key={w.id} value={w.id.toString()}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[errors.items?.[index]?.warehouse_id]} />
                  </Field>

                  <Field data-invalid={!!errors.items?.[index]?.quantity}>
                    <FieldLabel>Qty</FieldLabel>
                    <Input type="number" {...register(`items.${index}.quantity`)} />
                    <FieldError errors={[errors.items?.[index]?.quantity]} />
                  </Field>

                  <Field data-invalid={!!errors.items?.[index]?.unit_price}>
                    <FieldLabel>Price</FieldLabel>
                    <Input type="number" step="0.01" {...register(`items.${index}.unit_price`)} />
                    <FieldError errors={[errors.items?.[index]?.unit_price]} />
                  </Field>
                </FieldGroup>
                {fields.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => remove(index)}
                    className="mt-8 text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <div className="flex justify-end pt-4">
              <div className="w-full max-w-[250px] space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Grand Total:</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Order
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
