"use client";

import { ProfileForm } from "@/components/profile-form";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { useAuth } from "@/hooks/use-auth";

export default function AccountPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium">{user.email}</span> ·{" "}
          <span className="font-medium">{user.role.name}</span>
        </p>
      </div>
      <ProfileForm user={user} />
      <ChangePasswordForm />
    </div>
  );
}
