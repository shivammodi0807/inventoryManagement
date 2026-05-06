"use client";

import * as React from "react";
import { useForm, Path, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { isAxiosError } from "axios";

import { Warehouse } from "@/types/warehouse";
import { useCreateWarehouse, useUpdateWarehouse } from "@/hooks/use-warehouses";
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
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/types";

const warehouseSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  location: z.string().max(500, "Location is too long").optional().or(z.literal("")),
  is_active: z.boolean(),
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

interface WarehouseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Warehouse | null;
}

export function WarehouseModal({ open, onOpenChange, initialData }: WarehouseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        {open && (
          <WarehouseForm 
            initialData={initialData} 
            onClose={() => onOpenChange(false)} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface WarehouseFormProps {
  initialData?: Warehouse | null;
  onClose: () => void;
}

function WarehouseForm({ initialData, onClose }: WarehouseFormProps) {
  const isEditing = !!initialData;
  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      location: initialData.location || "",
      is_active: initialData.is_active,
    } : {
      name: "",
      location: "",
      is_active: true,
    },
  });

  const isActiveValue = useWatch({ control, name: "is_active" });

  const onSubmit = async (values: WarehouseFormValues) => {
    try {
      const payload = {
        name: values.name,
        location: values.location || null,
        is_active: values.is_active,
      };

      if (isEditing && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      if (isAxiosError<ApiError>(err)) {
        const data = err.response?.data;
        if (err.response?.status === 422 && data?.errors) {
          Object.entries(data.errors).forEach(([field, messages]) => {
            setError(field as Path<WarehouseFormValues>, { message: messages[0] });
          });
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Warehouse" : "Add Warehouse"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update the details for this warehouse location."
            : "Create a new warehouse location for storing inventory."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-5 py-5">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="warehouse-name">
            Warehouse Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="warehouse-name"
            {...register("name")}
            placeholder="e.g. Main Warehouse, East Hub"
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Location */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="warehouse-location">Location</Label>
          <Input
            id="warehouse-location"
            {...register("location")}
            placeholder="e.g. 123 Industrial Park, Mumbai"
          />
          {errors.location && (
            <p className="text-xs text-destructive">{errors.location.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Physical address or description of the warehouse location.
          </p>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="warehouse-active" className="text-sm font-medium">
              Active
            </Label>
            <p className="text-xs text-muted-foreground">
              Only active warehouses can receive new stock.
            </p>
          </div>
          <Switch
            id="warehouse-active"
            checked={isActiveValue}
            onCheckedChange={(checked) => setValue("is_active", checked)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Save Changes" : "Create Warehouse"}
        </Button>
      </DialogFooter>
    </form>
  );
}
