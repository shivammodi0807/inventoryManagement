import { Suspense } from "react";
import { VerifyEmailPrompt } from "@/components/verify-email-prompt";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Suspense fallback={null}>
          <VerifyEmailPrompt />
        </Suspense>
      </div>
    </div>
  );
}