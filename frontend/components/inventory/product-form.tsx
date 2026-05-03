"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, X } from "lucide-react";
import { isAxiosError } from "axios";
import Image from "next/image";

import { Product, Category, Unit } from "@/types/inventory";
import { getCategories, getUnits, createProduct, updateProduct } from "@/lib/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "sonner";
import { ApiError } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

const productSchema = z.object({
  sku: z.string().max(50).optional().or(z.literal("")),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  category_id: z.coerce.number().min(1, "Please select a category"),
  unit_id: z.coerce.number().min(1, "Please select a unit"),
  unit_price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  cost_price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  reorder_point: z.coerce.number().min(0),
  reorder_quantity: z.coerce.number().min(0),
  lead_time_days: z.coerce.number().min(0),
  is_active: z.boolean().default(true),
  image: z.any().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const { data: units, isLoading: isLoadingUnits } = useQuery({
    queryKey: ["units"],
    queryFn: () => getUnits(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: initialData
      ? {
          sku: initialData.sku,
          name: initialData.name,
          description: initialData.description || "",
          category_id: initialData.category_id,
          unit_id: initialData.unit_id,
          unit_price: initialData.unit_price,
          cost_price: initialData.cost_price,
          reorder_point: initialData.reorder_point,
          reorder_quantity: initialData.reorder_quantity,
          lead_time_days: initialData.lead_time_days,
          is_active: initialData.is_active,
        }
      : {
          sku: "",
          name: "",
          description: "",
          category_id: 0,
          unit_id: 0,
          unit_price: "0.00",
          cost_price: "0.00",
          reorder_point: 0,
          reorder_quantity: 0,
          lead_time_days: 0,
          is_active: true,
        },
  });

  const categoryId = watch("category_id");
  const unitId = watch("unit_id");
  const isActive = watch("is_active");

  const [imagePreview, setImagePreview] = React.useState<string | null>(initialData?.image_url || null);

  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === "image" && value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      return isEditing
        ? updateProduct(initialData!.id, formData)
        : createProduct(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(isEditing ? "Product updated" : "Product created");
      router.push("/dashboard/inventory/products");
    },
    onError: (err) => {
      if (isAxiosError<ApiError>(err)) {
        const data = err.response?.data;
        if (err.response?.status === 422 && data?.errors) {
          Object.entries(data.errors).forEach(([field, messages]) => {
            setError(field as any, { message: messages[0] });
          });
          return;
        }
        toast.error(data?.message || "Something went wrong");
      } else {
        toast.error("Unexpected error");
      }
    },
  });

  const onSubmit = (values: ProductFormValues) => mutation.mutate(values);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue("image", null);
    setImagePreview(null);
  };

  const isLoadingDropdowns = isLoadingCategories || isLoadingUnits;

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FieldGroup>
          {isEditing && (
            <Field>
              <FieldLabel htmlFor="sku">SKU</FieldLabel>
              <Input id="sku" {...register("sku")} disabled />
              <FieldError errors={[errors.sku]} />
              <FieldDescription>Unique product identifier.</FieldDescription>
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="image">Product Image</FieldLabel>
            <div className="mt-2 flex flex-col items-center gap-4">
              {imagePreview ? (
                <div className="relative h-40 w-40 overflow-hidden rounded-lg border">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex h-40 w-40 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                  <Upload className="mb-2 h-8 w-8" />
                  <span className="text-xs">No image uploaded</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  {imagePreview ? "Change Image" : "Upload Image"}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>
            <FieldError errors={[errors.image]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="name">Product Name</FieldLabel>
            <Input id="name" {...register("name")} placeholder="e.g. Wireless Mouse" />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="category_id">Category</FieldLabel>
            {isLoadingCategories ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                onValueChange={(v) => setValue("category_id", parseInt(v))}
                value={categoryId ? categoryId.toString() : ""}
                disabled={isLoadingDropdowns}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.data?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <FieldError errors={[errors.category_id]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="unit_id">Unit of Measure</FieldLabel>
            {isLoadingUnits ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                onValueChange={(v) => setValue("unit_id", parseInt(v))}
                value={unitId ? unitId.toString() : ""}
                disabled={isLoadingDropdowns}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {units?.data?.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.name} ({unit.abbreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <FieldError errors={[errors.unit_id]} />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="unit_price">Unit Price</FieldLabel>
              <Input id="unit_price" {...register("unit_price")} type="number" step="0.01" />
              <FieldError errors={[errors.unit_price]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="cost_price">Cost Price</FieldLabel>
              <Input id="cost_price" {...register("cost_price")} type="number" step="0.01" />
              <FieldError errors={[errors.cost_price]} />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field>
              <FieldLabel htmlFor="reorder_point">Reorder Point</FieldLabel>
              <Input id="reorder_point" {...register("reorder_point")} type="number" />
              <FieldError errors={[errors.reorder_point]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="reorder_quantity">Reorder Qty</FieldLabel>
              <Input id="reorder_quantity" {...register("reorder_quantity")} type="number" />
              <FieldError errors={[errors.reorder_quantity]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="lead_time_days">Lead Time (Days)</FieldLabel>
              <Input id="lead_time_days" {...register("lead_time_days")} type="number" />
              <FieldError errors={[errors.lead_time_days]} />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea 
              id="description" 
              {...register("description")} 
              placeholder="Detailed product description..."
              className="min-h-[100px]"
            />
            <FieldError errors={[errors.description]} />
          </Field>

          <Field>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FieldLabel htmlFor="is_active">Active Status</FieldLabel>
                <FieldDescription>
                  Whether this product is currently available for use.
                </FieldDescription>
              </div>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
            </div>
            <FieldError errors={[errors.is_active]} />
          </Field>
        </FieldGroup>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoadingDropdowns}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
