"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createRole, updateRole, type RolePayload } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ApiError, Role } from "@/types";

const roleSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().max(255).optional(),
});

type RoleValues = z.infer<typeof roleSchema>;

interface RoleModalProps {
  role?: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleModal({ role, open, onOpenChange }: RoleModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!role;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Reset form when modal opens or role changes
  React.useEffect(() => {
    if (open) {
      reset({
        name: role?.name ?? "",
        description: role?.description ?? "",
      });
    }
  }, [open, role, reset]);

  const mutation = useMutation({
    mutationFn: (values: RoleValues) => {
      if (isEditing && role) {
        return updateRole(role.id, values);
      }
      return createRole(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      onOpenChange(false);
      reset();
    },
    onError: (err) => {
      if (isAxiosError<ApiError>(err)) {
        const data = err.response?.data;
        if (err.response?.status === 422 && data?.errors) {
          if (data.errors.name) {
            setError("name", { message: data.errors.name[0] });
          }
          return;
        }
        setError("root.serverError", {
          message: data?.message ?? "An error occurred.",
        });
      }
    },
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Role" : "Create New Role"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the name and description for this role."
                : "Add a new role to the system. You can configure permissions after creating it."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <FieldGroup>
              {errors.root?.serverError && (
                <FieldError className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                  {errors.root.serverError.message}
                </FieldError>
              )}
              
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Role Name</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g. Manager"
                  disabled={role?.is_sealed}
                  {...register("name")}
                />
                <FieldError errors={errors.name ? [errors.name] : []} />
                {role?.is_sealed && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    System roles cannot be renamed.
                  </p>
                )}
              </Field>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="What can users with this role do?"
                  rows={3}
                  {...register("description")}
                />
                <FieldError errors={errors.description ? [errors.description] : []} />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
