"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { isAxiosError } from "axios";

import { resendVerificationRequest } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ApiError } from "@/types";

export function VerifyEmailPrompt() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const email = searchParams.get("email") ?? user?.email ?? null;

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onResend = async () => {
    if (!isAuthenticated) {
      setStatus("error");
      setErrorMsg("Please sign in first to request a new verification email.");
      return;
    }
    setStatus("sending");
    setErrorMsg(null);
    try {
      await resendVerificationRequest();
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      if (isAxiosError<ApiError>(err)) {
        setErrorMsg(
          err.response?.status === 429
            ? "Too many requests. Wait a minute and try again."
            : err.response?.data?.message ?? "Couldn't send the email. Try again.",
        );
      } else {
        setErrorMsg("Unexpected error. Try again.");
      }
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Verify your email</CardTitle>
        <CardDescription>
          {email ? (
            <>
              We sent a verification link to <strong>{email}</strong>. Click it to activate your
              account.
            </>
          ) : (
            <>Check your inbox for a verification link to activate your account.</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "sent" && (
          <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">
            A new verification email is on its way. Check your inbox (and spam folder).
          </p>
        )}
        {status === "error" && errorMsg && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
            {errorMsg}
          </p>
        )}
        <Button onClick={onResend} disabled={status === "sending"} className="w-full">
          {status === "sending" ? "Sending..." : "Resend verification email"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {isAuthenticated ? (
            <Link href="/dashboard" className="underline underline-offset-4 hover:no-underline">
              Go to dashboard
            </Link>
          ) : (
            <Link href="/login" className="underline underline-offset-4 hover:no-underline">
              Back to sign in
            </Link>
          )}
        </p>
      </CardContent>
    </Card>
  );
}