"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";

import { changePassword } from "@/lib/auth";
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
import type { ApiError } from "@/types";

const schema = z
  .object({
    current_password: z.string().min(1, { message: "Current password is required" }),
    password: z.string().min(8, { message: "Must be at least 8 characters" }),
    password_confirmation: z.string().min(1, { message: "Confirm the password" }),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

type Values = z.infer<typeof schema>;

export function ChangePasswordForm() {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const mutation = useMutation({ mutationFn: changePassword });

  const formError = errors.root?.serverError?.message;

  const onSubmit = handleSubmit(async (values) => {
    setSuccess(false);
    try {
      await mutation.mutateAsync(values);
      setSuccess(true);
      reset();
    } catch (err) {
      if (isAxiosError<ApiError>(err)) {
        const data = err.response?.data;
        if (err.response?.status === 422 && data?.errors) {
          for (const [field, messages] of Object.entries(data.errors)) {
            if (
              field === "current_password" ||
              field === "password" ||
              field === "password_confirmation"
            ) {
              setError(field, {
                type: "server",
                message: messages?.[0] ?? "Invalid value",
              });
            }
          }
          return;
        }
        setError("root.serverError", {
          type: "server",
          message: data?.message ?? "Unable to update password.",
        });
        return;
      }
      setError("root.serverError", {
        type: "server",
        message: "Unexpected error. Try again.",
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Choose a strong password you don&apos;t use anywhere else.
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
            {success && (
              <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">
                Password updated.
              </p>
            )}
            <Field data-invalid={!!errors.current_password}>
              <FieldLabel htmlFor="current_password">Current password</FieldLabel>
              <Input
                id="current_password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.current_password}
                {...register("current_password")}
              />
              <FieldError
                errors={errors.current_password ? [errors.current_password] : []}
              />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">New password</FieldLabel>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update password"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
