"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { getUserById } from "@/lib/users";
import { UserEditForm } from "@/components/user-edit-form";

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = Number(id);
  const { can, isLoading } = useAuth();
  const canEdit = can("edit", "user");

  const userQuery = useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUserById(userId),
    enabled: canEdit && Number.isFinite(userId),
  });

  if (isLoading) return null;

  if (!canEdit) {
    return (
      <div className="mx-auto max-w-md rounded-md border border-destructive/30 bg-destructive/10 p-6">
        <h1 className="text-lg font-semibold">403 — Forbidden</h1>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to edit users.
        </p>
      </div>
    );
  }

  if (userQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading user...</p>;
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <div className="mx-auto max-w-md rounded-md border border-destructive/30 bg-destructive/10 p-6">
        <h1 className="text-lg font-semibold">User not found</h1>
        <p className="text-sm text-muted-foreground">
          The user you&apos;re trying to edit doesn&apos;t exist or is unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <UserEditForm user={userQuery.data} />
    </div>
  );
}
