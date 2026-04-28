"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { isAxiosError } from "axios";

import { verifyEmailRequest } from "@/lib/auth";
import { useAuth, USER_QUERY_KEY } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ApiError } from "@/types";

type State =
  | { kind: "verifying" }
  | { kind: "success"; alreadyVerified: boolean }
  | { kind: "error"; message: string };

export function VerifyEmailConsumer() {
  const params = useParams<{ id: string; hash: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<State>({ kind: "verifying" });
  const [isPending, startTransition] = useTransition();
  // React 19 / Next 16 strict-mode dev double-mount guard.
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const id = params?.id;
    const hash = params?.hash;
    const expires = searchParams.get("expires");
    const signature = searchParams.get("signature");

    if (!id || !hash || !expires || !signature) {
      startTransition(() => {
        setState({ kind: "error", message: "This verification link is malformed." });
      });
      return;
    }

    verifyEmailRequest({ id, hash, expires, signature })
      .then((res) => {
        startTransition(() => {
          setState({ kind: "success", alreadyVerified: res.already_verified });
        });
        // Refresh /api/user so any open tabs see email_verified_at update.
        queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
      })
      .catch((err) => {
        let msg = "We couldn't verify your email. The link may have expired.";
        if (isAxiosError<ApiError>(err)) {
          msg = err.response?.data?.message ?? msg;
        }
        startTransition(() => {
          setState({ kind: "error", message: msg });
        });
      });
  }, [params, searchParams, queryClient]);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {state.kind === "verifying" && "Verifying your email..."}
          {state.kind === "success" && "Email verified"}
          {state.kind === "error" && "Verification failed"}
        </CardTitle>
        <CardDescription>
          {state.kind === "verifying" && "Hold tight — this only takes a moment."}
          {state.kind === "success" &&
            (state.alreadyVerified
              ? "Your email was already verified. You're all set."
              : "Thanks for confirming. You can now sign in.")}
          {state.kind === "error" && state.message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.kind === "success" && (
          <Button
            className="w-full"
            onClick={() => router.replace(isAuthenticated ? "/dashboard" : "/login")}
            disabled={isPending}
          >
            {isAuthenticated ? "Go to dashboard" : "Sign in"}
          </Button>
        )}
        {state.kind === "error" && (
          <div className="space-y-2 text-center text-sm">
            <Link href="/verify-email" className="block underline underline-offset-4 hover:no-underline">
              Request a new verification email
            </Link>
            <Link href="/login" className="block text-muted-foreground underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}