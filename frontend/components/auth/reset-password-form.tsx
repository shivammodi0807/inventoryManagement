"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";

import { cn } from "@/lib/utils";
import { resetPasswordRequest } from "@/lib/auth";
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
    email: z.email({ message: "Enter a valid email address" }),
    password: z.string().min(8, { message: "Must be at least 8 characters" }),
    password_confirmation: z.string().min(1, { message: "Confirm the password" }),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

type Values = z.infer<typeof schema>;

export function ResetPasswordForm({
  token,
  className,
  ...props
}: { token: string } & React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromLink = searchParams.get("email") ?? "";
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: emailFromLink, password: "", password_confirmation: "" },
  });

  const formError = errors.root?.serverError?.message;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await resetPasswordRequest({ ...values, token });
      setDone(true);
      setTimeout(() => router.replace("/login"), 1500);
    } catch (err) {
      if (isAxiosError<ApiError>(err)) {
        const status = err.response?.status;
        const data = err.response?.data;
        if (status === 422 && data?.errors) {
          for (const [field, messages] of Object.entries(data.errors)) {
            if (field === "email" || field === "password") {
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
          message: data?.message ?? "Unable to reset password. Try again.",
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>
            Choose a new password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">
              Password updated. Redirecting to sign-in...
            </p>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <FieldGroup>
                {formError && (
                  <FieldError className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                    {formError}
                  </FieldError>
                )}
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
                    {isSubmitting ? "Resetting..." : "Reset password"}
                  </Button>
                  <Link
                    href="/login"
                    className="text-center text-sm underline-offset-4 hover:underline"
                  >
                    Back to sign in
                  </Link>
                </Field>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
