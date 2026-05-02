"use client";

import { UserCreateForm } from "@/components/user-create-form";
import { useAuth } from "@/hooks/use-auth";

export default function NewUserPage() {
  const { can, isLoading } = useAuth();

  if (isLoading) return null;

  if (!can("create", "user")) {
    return (
      <div className="mx-auto max-w-md rounded-md border border-destructive/30 bg-destructive/10 p-6">
        <h1 className="text-lg font-semibold">403 — Forbidden</h1>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to provision new users.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <UserCreateForm />
    </div>
  );
}
