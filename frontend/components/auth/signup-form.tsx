"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";

import { cn } from "@/lib/utils";
import { registerRequest } from "@/lib/auth";
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
import { PasswordInput } from "./password-input";

const schema = z
  .object({
    full_name: z.string().min(1, { message: "Full name is required" }).max(255),
    email: z.email({ message: "Enter a valid email address" }),
    password: z
      .string()
      .min(12, { message: "Use at least 12 characters" })
      .regex(/[a-z]/, { message: "Add a lowercase letter" })
      .regex(/[A-Z]/, { message: "Add an uppercase letter" })
      .regex(/[0-9]/, { message: "Add a number" })
      .regex(/[^A-Za-z0-9]/, { message: "Add a symbol" }),
    password_confirmation: z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

type Values = z.infer<typeof schema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const formError = errors.root?.serverError?.message;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerRequest(values);
      router.replace(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (err) {
      if (isAxiosError<ApiError>(err)) {
        const status = err.response?.status;
        const data = err.response?.data;
        if (status === 422 && data?.errors) {
          for (const [field, messages] of Object.entries(data.errors)) {
            if (field in (values as object)) {
              setError(field as keyof Values, {
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
            (status === 429
              ? "Too many attempts. Please wait and try again."
              : "Unable to sign up. Please try again."),
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
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Sign up for Qollab — it only takes a minute.
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
                <FieldLabel htmlFor="full_name">Full Name</FieldLabel>
                <Input
                  id="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  aria-invalid={!!errors.full_name}
                  {...register("full_name")}
                />
                <FieldError
                  errors={errors.full_name ? [errors.full_name] : []}
                />
              </Field>
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
              <PasswordInput
                label="Password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password")}
              />

              <PasswordInput
                label="Confirm Password"
                autoComplete="new-password"
                error={errors.password_confirmation?.message}
                {...register("password_confirmation")}
              />
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
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
        </CardContent>
      </Card>
    </div>
  );
}
