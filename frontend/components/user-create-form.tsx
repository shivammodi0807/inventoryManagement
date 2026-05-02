"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { createUser, type CreateUserPayload } from "@/lib/users";
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ApiError } from "@/types";

const createUserSchema = z
  .object({
    full_name: z.string().min(1, { message: "Full name is required" }).max(255),
    email: z.email({ message: "Enter a valid email address" }),
    password: z.string().min(8, { message: "Must be at least 8 characters" }),
    password_confirmation: z.string().min(1, { message: "Confirm the password" }),
    role_id: z.number().int().positive({ message: "Pick a role" }),
    is_active: z.boolean().optional(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

type CreateUserValues = z.infer<typeof createUserSchema>;

const SERVER_FIELDS = [
  "full_name",
  "email",
  "password",
  "role_id",
  "is_active",
] as const;

export function UserCreateForm({ className }: { className?: string }) {
  const router = useRouter();

  const rolesQuery = useQuery({ queryKey: ["roles"], queryFn: listRoles });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role_id: 0,
      is_active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateUserPayload) => createUser(values),
  });

  const formError = errors.root?.serverError?.message;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(values);
      reset();
      router.push("/dashboard/settings/users");
      router.refresh();
    } catch (err) {
      if (isAxiosError<ApiError>(err)) {
        const status = err.response?.status;
        const data = err.response?.data;
        if (status === 422 && data?.errors) {
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
            (status === 403
              ? "You do not have permission to create users."
              : "Unable to create user. Please try again."),
        });
        return;
      }
      setError("root.serverError", {
        type: "server",
        message: "Unexpected error. Please try again.",
      });
    }
  });

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Create a new user</CardTitle>
          <CardDescription>
            Provision an account. The user will be able to sign in immediately
            with the credentials you set here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
              {formError && (
                <FieldError className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                  {formError}
                </FieldError>
              )}
              <Field data-invalid={!!errors.full_name}>
                <FieldLabel htmlFor="full_name">Full name</FieldLabel>
                <Input
                  id="full_name"
                  type="text"
                  autoComplete="name"
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
                  autoComplete="off"
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
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={rolesQuery.isLoading}
                  {...register("role_id", { valueAsNumber: true })}
                >
                  <option value={0}>
                    {rolesQuery.isLoading ? "Loading roles..." : "Select a role"}
                  </option>
                  {rolesQuery.data?.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                      {role.description ? ` — ${role.description}` : ""}
                    </option>
                  ))}
                </select>
                <FieldError errors={errors.role_id ? [errors.role_id] : []} />
              </Field>
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
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
                  Confirm password
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
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-input"
                    {...register("is_active")}
                  />
                  Active (can sign in immediately)
                </label>
              </Field>
              <Field>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create user"}
                </Button>
                <FieldDescription className="text-center">
                  Only administrators can provision new accounts.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
