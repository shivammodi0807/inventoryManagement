"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateProfile } from "@/lib/auth";
import { USER_QUERY_KEY } from "@/hooks/use-auth";
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

const schema = z.object({
  full_name: z.string().min(1, { message: "Full name is required" }).max(255),
  email: z.email({ message: "Enter a valid email address" }),
});

type Values = z.infer<typeof schema>;

export function ProfileForm({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: user.full_name, email: user.email },
  });

  // Keep the form in sync if the cached user is refreshed elsewhere.
  useEffect(() => {
    reset({ full_name: user.full_name, email: user.email });
  }, [user.full_name, user.email, reset]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(USER_QUERY_KEY, updated);
      setSuccess(true);
      reset({ full_name: updated.full_name, email: updated.email });
    },
  });

  const formError = errors.root?.serverError?.message;

  const onSubmit = handleSubmit(async (values) => {
    setSuccess(false);
    try {
      await mutation.mutateAsync(values);
    } catch (err) {
      if (isAxiosError<ApiError>(err)) {
        const data = err.response?.data;
        if (err.response?.status === 422 && data?.errors) {
          for (const [field, messages] of Object.entries(data.errors)) {
            if (field === "email" || field === "full_name") {
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
          message: data?.message ?? "Unable to update profile.",
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
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update your name and email address. Changes take effect immediately.
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
                Profile updated.
              </p>
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
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError errors={errors.email ? [errors.email] : []} />
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
