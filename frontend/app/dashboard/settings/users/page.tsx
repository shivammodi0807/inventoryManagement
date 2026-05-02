"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { useAuth } from "@/hooks/use-auth";
import { deleteUser, listUsers } from "@/lib/users";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ApiError, User } from "@/types";

export default function UsersPage() {
  const { user: currentUser, can, isLoading } = useAuth();
  const canView = can("view", "user");
  const canCreate = can("create", "user");
  const canEdit = can("edit", "user");
  const canDelete = can("delete", "user");
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ["users", page],
    queryFn: () => listUsers(page),
    enabled: canView,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: unknown) => {
      if (isAxiosError<ApiError>(err)) {
        setActionError(
          err.response?.data?.message ??
            (err.response?.status === 403
              ? "You don't have permission to delete users."
              : "Unable to delete user."),
        );
        return;
      }
      setActionError("Unexpected error.");
    },
  });

  if (isLoading) return null;

  if (!canView) {
    return (
      <div className="mx-auto max-w-md rounded-md border border-destructive/30 bg-destructive/10 p-6">
        <h1 className="text-lg font-semibold">403 — Forbidden</h1>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to view users.
        </p>
      </div>
    );
  }

  const users = usersQuery.data?.data ?? [];
  const lastPage = usersQuery.data?.last_page ?? 1;

  const onDelete = (u: User) => {
    if (u.id === currentUser?.id) {
      setActionError("You can't delete your own account.");
      return;
    }
    if (!window.confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    deleteMutation.mutate(u.id);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage the people who can sign in to Qollab.
            </CardDescription>
          </div>
          {canCreate && (
            <Button asChild>
              <Link href="/dashboard/settings/users/new">New user</Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {actionError && (
            <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {actionError}
            </p>
          )}
          {usersQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Email</th>
                    <th className="py-2 pr-4 font-medium">Role</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-b-0">
                      <td className="py-3 pr-4">{u.full_name}</td>
                      <td className="py-3 pr-4">{u.email}</td>
                      <td className="py-3 pr-4">{u.role.name}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={
                            u.is_active
                              ? "inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                              : "inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
                          }
                        >
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {canEdit || canDelete ? (
                          <div className="inline-flex gap-2">
                            {canEdit && (
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/dashboard/settings/users/${u.id}/edit`}>
                                  Edit
                                </Link>
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={
                                  deleteMutation.isPending ||
                                  u.id === currentUser?.id
                                }
                                onClick={() => onDelete(u)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            View only
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {lastPage > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || usersQuery.isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-muted-foreground">
                Page {page} of {lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= lastPage || usersQuery.isFetching}
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
