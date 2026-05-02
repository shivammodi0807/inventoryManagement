"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
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

const loginSchema = z.object({
  email: z.email({ message: "Enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const { login, loginLoading } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const formError = errors.root?.serverError?.message;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await login(values);

      if (!user.email_verified_at) {
        router.replace("/verify-email");
        return;
      }

      const target = nextPath.startsWith("/") ? nextPath : "/dashboard";
      router.replace(target);
      router.refresh();
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
          message:
            data?.message ??
            (status === 429
              ? "Too many attempts. Please wait and try again."
              : "Unable to sign in. Please try again."),
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in with your Qollab account to continue
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
                error={errors.password?.message}
                forgetPasswordRequired={true}
                {...register("password")}
              />

              <Field>
                <Button type="submit" disabled={loginLoading}>
                  {loginLoading ? "Signing in..." : "Sign in"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="underline underline-offset-4 hover:no-underline"
                  >
                    Create one
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
