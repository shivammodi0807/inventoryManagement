"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { isAxiosError } from "axios";

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
import { createCategory, updateCategory } from "@/lib/inventory";
import { Category } from "@/types/inventory";
import { ApiError } from "@/types";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryModalProps { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  initialData?: Category | null;
}

export function CategoryModal({ open, onOpenChange, initialData }: CategoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {open && (
          <CategoryForm 
            initialData={initialData} 
            onClose={() => onOpenChange(false)} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface CategoryFormProps {
  initialData?: Category | null;
  onClose: () => void;
}

function CategoryForm({ initialData, onClose }: CategoryFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CategoryFormValues) => 
      isEditing 
        ? updateCategory(initialData!.id, data) 
        : createCategory(data),
    onSuccess: () => {
      toast.success(isEditing ? "Category updated successfully" : "Category created successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onClose();
    },
    onError: (error) => {
      let message = `Failed to ${isEditing ? 'update' : 'create'} category`;
      if (isAxiosError<ApiError>(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    },
  });

  const onSubmit = (data: CategoryFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogDescription>
          {isEditing 
            ? "Update the details for this category." 
            : "Create a new category to group your products."}
        </DialogDescription>
      </DialogHeader>

      <Field>
        <FieldLabel htmlFor="cat-name">Name</FieldLabel>
        <Input id="cat-name" placeholder="e.g. Electronics, Furniture" {...register("name")} />
        <FieldError errors={[errors.name]} />
      </Field>

      <Field>
        <FieldLabel htmlFor="cat-description">Description (Optional)</FieldLabel>
        <Textarea 
          id="cat-description"
          placeholder="Brief description of the category..." 
          className="resize-none" 
          {...register("description")} 
        />
        <FieldError errors={[errors.description]} />
      </Field>

      <DialogFooter className="mt-6">
        <Button variant="outline" type="button" onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Category" : "Save Category"}
        </Button>
      </DialogFooter>
    </form>
  );
}
