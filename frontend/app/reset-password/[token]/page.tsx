"use client";

import { use, Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Suspense fallback={null}>
          <ResetPasswordForm token={token} />
        </Suspense>
      </div>
    </div>
  );
}
