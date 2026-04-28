import { Suspense } from "react";
import { VerifyEmailConsumer } from "@/components/verify-email-consumer";

export default function VerifyEmailConsumerPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Suspense fallback={null}>
          <VerifyEmailConsumer />
        </Suspense>
      </div>
    </div>
  );
}