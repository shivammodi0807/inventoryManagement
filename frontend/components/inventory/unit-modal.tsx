"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import { createUnit } from "@/lib/inventory";

const unitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  abbreviation: z.string().min(1, "Abbreviation is required").max(10),
});

type UnitFormValues = z.infer<typeof unitSchema>;

interface UnitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnitModal({ open, onOpenChange }: UnitModalProps) {
  const queryClient = useQueryClient();

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

  const mutation = useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      toast.success("Unit created successfully");
      queryClient.invalidateQueries({ queryKey: ["units"] });
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create unit");
    },
  });

  function onSubmit(data: UnitFormValues) {
    mutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Unit</DialogTitle>
          <DialogDescription>
            Create a new unit of measure for your products.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input id="name" placeholder="e.g. Kilogram, Piece" {...register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>
          
          <Field>
            <FieldLabel htmlFor="abbreviation">Abbreviation</FieldLabel>
            <Input id="abbreviation" placeholder="e.g. kg, pc" {...register("abbreviation")} />
            <FieldError errors={[errors.abbreviation]} />
          </Field>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Save Unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
