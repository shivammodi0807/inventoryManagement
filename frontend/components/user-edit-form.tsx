"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { updateUser, type UpdateUserPayload } from "@/lib/users";
import { listRoles } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ApiError, User } from "@/types";

const schema = z
  .object({
    full_name: z.string().min(1).max(255),
    email: z.email({ message: "Enter a valid email address" }),
    role_id: z.number().int().positive({ message: "Pick a role" }),
    is_active: z.boolean(),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
  })
  .refine(
    (v) => !v.password || v.password.length >= 8,
    { path: ["password"], message: "Must be at least 8 characters" },
  )
  .refine(
    (v) => !v.password || v.password === v.password_confirmation,
    { path: ["password_confirmation"], message: "Passwords do not match" },
  );

type Values = z.infer<typeof schema>;

const SERVER_FIELDS = [
  "full_name",
  "email",
  "role_id",
  "is_active",
  "password",
] as const;

export function UserEditForm({ user }: { user: User }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const rolesQuery = useQuery({ queryKey: ["roles"], queryFn: listRoles });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: user.full_name,
      email: user.email,
      role_id: user.role.id,
      is_active: user.is_active,
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    reset({
      full_name: user.full_name,
      email: user.email,
      role_id: user.role.id,
      is_active: user.is_active,
      password: "",
      password_confirmation: "",
    });
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(user.id, payload),
    onSuccess: (updated) => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset({
        full_name: updated.full_name,
        email: updated.email,
        role_id: updated.role.id,
        is_active: updated.is_active,
        password: "",
        password_confirmation: "",
      });
    },
  });

  const formError = errors.root?.serverError?.message;

  const onSubmit = handleSubmit(async (values) => {
    setSuccess(false);
    const payload: UpdateUserPayload = {
      full_name: values.full_name,
      email: values.email,
      role_id: values.role_id,
      is_active: values.is_active,
    };
    if (values.password) {
      payload.password = values.password;
    }
    try {
      await mutation.mutateAsync(payload);
    } catch (err) {
      if (isAxiosError<ApiError>(err)) {
        const data = err.response?.data;
        if (err.response?.status === 422 && data?.errors) {
          for (const [field, messages] of Object.entries(data.errors)) {
            if ((SERVER_FIELDS as readonly string[]).includes(field)) {
              setError(field as (typeof SERVER_FIELDS)[number], {
                type: "server",
                message: messages?.[0] ?? "Invalid value",
              });
            }
          }
          return;
        }
        setError("root.serverError", {
          type: "server",
          message:
            data?.message ??
            (err.response?.status === 403
              ? "You don't have permission to edit users."
              : "Unable to update user."),
        });
        return;
      }
      setError("root.serverError", {
        type: "server",
        message: "Unexpected error.",
      });
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Edit user</CardTitle>
          <CardDescription>Update {user.email}.</CardDescription>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/settings/users")}>
          Back
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            {formError && (
              <FieldError className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                {formError}
              </FieldError>
            )}
            {success && (
              <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">
                User updated.
              </p>
            )}
            <Field data-invalid={!!errors.full_name}>
              <FieldLabel htmlFor="full_name">Full name</FieldLabel>
              <Input
                id="full_name"
                type="text"
                aria-invalid={!!errors.full_name}
                {...register("full_name")}
              />
              <FieldError errors={errors.full_name ? [errors.full_name] : []} />
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError errors={errors.email ? [errors.email] : []} />
            </Field>
            <Field data-invalid={!!errors.role_id}>
              <FieldLabel htmlFor="role_id">Role</FieldLabel>
              <select
                id="role_id"
                aria-invalid={!!errors.role_id}
                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                disabled={rolesQuery.isLoading}
                {...register("role_id", { valueAsNumber: true })}
              >
                {rolesQuery.data?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                    {role.description ? ` — ${role.description}` : ""}
                  </option>
                ))}
              </select>
              <FieldError errors={errors.role_id ? [errors.role_id] : []} />
            </Field>
            <Field>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input"
                  {...register("is_active")}
                />
                Active (can sign in)
              </label>
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">
                New password{" "}
                <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <FieldError errors={errors.password ? [errors.password] : []} />
            </Field>
            <Field data-invalid={!!errors.password_confirmation}>
              <FieldLabel htmlFor="password_confirmation">
                Confirm new password
              </FieldLabel>
              <Input
                id="password_confirmation"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password_confirmation}
                {...register("password_confirmation")}
              />
              <FieldError
                errors={
                  errors.password_confirmation
                    ? [errors.password_confirmation]
                    : []
                }
              />
            </Field>
            <Field>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
