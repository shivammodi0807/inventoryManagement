"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Field, 
  FieldLabel, 
  FieldError 
} from "@/components/ui/field";
import { createUnit, updateUnit } from "@/lib/inventory";
import { Unit } from "@/types/inventory";

const unitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  abbreviation: z.string().min(1, "Abbreviation is required").max(10),
});

type UnitFormValues = z.infer<typeof unitSchema>;

interface UnitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Unit | null;
}

export function UnitModal({ open, onOpenChange, initialData }: UnitModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: "",
      abbreviation: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset(initialData ? {
        name: initialData.name,
        abbreviation: initialData.abbreviation,
      } : {
        name: "",
        abbreviation: "",
      });
    }
  }, [open, initialData, reset]);

  const mutation = useMutation({
    mutationFn: (data: UnitFormValues) => 
      isEditing 
        ? updateUnit(initialData!.id, data) 
        : createUnit(data),
    onSuccess: () => {
      toast.success(isEditing ? "Unit updated successfully" : "Unit created successfully");
      queryClient.invalidateQueries({ queryKey: ["units"] });
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} unit`);
    },
  });

  function onSubmit(data: UnitFormValues) {
    mutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Unit" : "Add Unit"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the details for this unit of measure." 
              : "Create a new unit of measure for your products."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="unit-name">Name</FieldLabel>
            <Input id="unit-name" placeholder="e.g. Kilogram, Piece" {...register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>
          
          <Field>
            <FieldLabel htmlFor="unit-abbreviation">Abbreviation</FieldLabel>
            <Input id="unit-abbreviation" placeholder="e.g. kg, pc" {...register("abbreviation")} />
            <FieldError errors={[errors.abbreviation]} />
          </Field>

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Unit" : "Save Unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
