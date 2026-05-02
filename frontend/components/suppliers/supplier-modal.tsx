"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { isAxiosError } from "axios";

import { Supplier } from "@/types/supplier";
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/use-suppliers";
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
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/types";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  contact_name: z.string().max(255).optional().or(z.literal("")),
  email: z.string().email("Invalid email").max(255).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  address: z.string().max(1000).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  payment_terms: z.string().max(100).optional().or(z.literal("")),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Supplier | null;
}

export function SupplierModal({ open, onOpenChange, initialData }: SupplierModalProps) {
  const isEditing = !!initialData;
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contact_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      payment_terms: "",
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        contact_name: initialData.contact_name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        city: initialData.city || "",
        country: initialData.country || "",
        payment_terms: initialData.payment_terms || "",
      });
    } else {
      reset({
        name: "",
        contact_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        payment_terms: "",
      });
    }
  }, [initialData, reset, open]);

  const onSubmit = async (values: SupplierFormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: initialData.id, data: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      onOpenChange(false);
      reset();
    } catch (err) {
      if (isAxiosError<ApiError>(err)) {
        const data = err.response?.data;
        if (err.response?.status === 422 && data?.errors) {
          Object.entries(data.errors).forEach(([field, messages]) => {
            setError(field as any, { message: messages[0] });
          });
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the details for this supplier."
                : "Enter the details to add a new supplier to your catalog."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Acme Corp"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="contact_name">Contact Person</Label>
                <Input id="contact_name" {...register("contact_name")} placeholder="John Doe" />
                {errors.contact_name && (
                  <p className="text-xs text-destructive">{errors.contact_name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" {...register("email")} placeholder="vendor@example.com" />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} placeholder="+1 234 567 890" />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" {...register("address")} placeholder="123 Industrial Way" />
              {errors.address && (
                <p className="text-xs text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} placeholder="New York" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register("country")} placeholder="USA" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Input id="payment_terms" {...register("payment_terms")} placeholder="Net 30" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Supplier" : "Add Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
