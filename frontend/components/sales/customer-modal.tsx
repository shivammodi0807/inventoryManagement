"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Customer } from "@/types/customer";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  tax_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Customer | null;
}

export function CustomerModal({ open, onOpenChange, initialData }: CustomerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Customer" : "Add New Customer"}</DialogTitle>
        </DialogHeader>
        {open && (
          <CustomerForm
            initialData={initialData}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface CustomerFormProps {
  initialData?: Customer | null;
  onClose: () => void;
}

function CustomerForm({ initialData, onClose }: CustomerFormProps) {
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      address: initialData?.address ?? "",
      tax_id: initialData?.tax_id ?? "",
      is_active: initialData ? !!initialData.is_active : true,
    },
  });

  const isActive = useWatch({ control, name: "is_active" });

  const onSubmit = async (values: CustomerFormValues) => {
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, data: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      onClose();
    } catch {
      // Error handled in hook
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Customer Name</FieldLabel>
          <Input id="name" placeholder="Acme Corp" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" placeholder="contact@acme.com" {...register("email")} />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input id="phone" placeholder="+1 234 567 890" {...register("phone")} />
            <FieldError errors={[errors.phone]} />
          </Field>
        </div>

        <Field data-invalid={!!errors.tax_id}>
          <FieldLabel htmlFor="tax_id">Tax ID / GSTIN</FieldLabel>
          <Input id="tax_id" placeholder="Optional" {...register("tax_id")} />
          <FieldError errors={[errors.tax_id]} />
        </Field>

        <Field data-invalid={!!errors.address}>
          <FieldLabel htmlFor="address">Billing Address</FieldLabel>
          <Textarea id="address" placeholder="Full address" {...register("address")} />
          <FieldError errors={[errors.address]} />
        </Field>

        <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <FieldLabel>Active Status</FieldLabel>
            <div className="text-xs text-muted-foreground">
              Only active customers can be selected for new sales orders.
            </div>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => setValue("is_active", checked)}
          />
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : initialData ? "Update Customer" : "Create Customer"}
        </Button>
      </DialogFooter>
    </form>
  );
}
