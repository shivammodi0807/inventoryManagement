"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";

import { cn } from "@/lib/utils";
import { forgotPasswordRequest } from "@/lib/auth";
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

const schema = z.object({
  email: z.email({ message: "Enter a valid email address" }),
});

type Values = z.infer<typeof schema>;

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const formError = errors.root?.serverError?.message;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await forgotPasswordRequest(values);
      setSubmitted(true);
    } catch (err) {
      if (isAxiosError<ApiError>(err)) {
        const status = err.response?.status;
        const data = err.response?.data;
        if (status === 422 && data?.errors?.email) {
          setError("email", {
            type: "server",
            message: data.errors.email[0] ?? "Invalid email",
          });
          return;
        }
        setError("root.serverError", {
          type: "server",
          message: data?.message ?? "Unable to send reset link. Try again.",
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
          <CardTitle className="text-xl">Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a link to reset it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-4">
              <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">
                If an account exists for that email, a reset link is on its way.
                Check your inbox (and spam folder).
              </p>
              <Link
                href="/login"
                className="block text-center text-sm underline-offset-4 hover:underline"
              >
                Back to sign in
              </Link>
            </div>
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
                    placeholder="you@company.com"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                  <FieldError errors={errors.email ? [errors.email] : []} />
                </Field>
                <Field>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send reset link"}
                  </Button>
                  <FieldDescription className="text-center">
                    Remembered it?{" "}
                    <Link
                      href="/login"
                      className="underline underline-offset-4 hover:no-underline"
                    >
                      Sign in
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
