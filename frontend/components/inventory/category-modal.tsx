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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Field, 
  FieldLabel, 
  FieldError 
} from "@/components/ui/field";
import { createCategory } from "@/lib/inventory";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryModalProps { open: boolean; onOpenChange: (open: boolean) => void; }

export function CategoryModal({ open, onOpenChange }: CategoryModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create category");
    },
  });

  function onSubmit(data: CategoryFormValues) {
    mutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>
            Create a new category to group your products.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input id="name" placeholder="e.g. Electronics, Furniture" {...register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Description (Optional)</FieldLabel>
            <Textarea 
              id="description"
              placeholder="Brief description of the category..." 
              className="resize-none" 
              {...register("description")} 
            />
            <FieldError errors={[errors.description]} />
          </Field>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Save Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
