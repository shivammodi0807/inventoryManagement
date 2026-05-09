"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ShieldCheckIcon, Trash2Icon, UserIcon, PlusIcon, PencilIcon } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { deleteRole, listRoles } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleModal } from "@/components/settings/role-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { ApiError, Role } from "@/types";

export default function RolesPage() {
  const { can, isLoading } = useAuth();
  const canView = can("view", "role");
  const canCreate = can("create", "role");
  const canEdit = can("edit", "role");
  const canDelete = can("delete", "role");

  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: listRoles,
    enabled: canView,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      setActionError(null);
      setConfirmOpen(false);
      setRoleToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err: unknown) => {
      if (isAxiosError<ApiError>(err)) {
        setActionError(
          err.response?.data?.message ??
            (err.response?.status === 403
              ? "You don't have permission to delete roles."
              : "Unable to delete role."),
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
          You don&apos;t have permission to view roles.
        </p>
      </div>
    );
  }

  const roles = rolesQuery.data ?? [];

  const onDelete = (r: Role) => {
    if (r.is_sealed) {
      setActionError("Sealed roles cannot be deleted.");
      return;
    }
    if (r.user_count && r.user_count > 0) {
      setActionError("This role is still assigned to users and cannot be deleted.");
      return;
    }
    setRoleToDelete(r);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (roleToDelete) {
      deleteMutation.mutate(roleToDelete.id);
    }
  };

  const openCreateModal = () => {
    setSelectedRole(null);
    setModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setModalOpen(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Roles</CardTitle>
            <CardDescription>
              Define what different types of users can see and do in the system.
            </CardDescription>
          </div>
          {canCreate && (
            <Button onClick={openCreateModal} className="gap-2">
              <PlusIcon className="size-4" />
              New Role
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {actionError && (
            <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {actionError}
            </p>
          )}
          {rolesQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading roles...</p>
          ) : roles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No roles found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Role Name</th>
                    <th className="py-2 pr-4 font-medium">Description</th>
                    <th className="py-2 pr-4 font-medium text-center">Users</th>
                    <th className="py-2 pr-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r) => (
                    <tr key={r.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{r.name}</span>
                          {r.is_sealed && (
                            <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0 h-4">
                              Sealed
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {r.description || "—"}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <UserIcon className="size-3.5 text-muted-foreground" />
                          <span>{r.user_count ?? 0}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <div className="inline-flex gap-2">
                          {canEdit && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => openEditModal(r)}
                            >
                              <PencilIcon className="size-3.5" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          )}
                          {canEdit && (
                            <Button asChild size="sm" variant="outline" className="gap-1.5 h-8">
                              <Link href={`/dashboard/settings/roles/${r.id}`}>
                                <ShieldCheckIcon className="size-3.5" />
                                Permissions
                              </Link>
                            </Button>
                          )}
                          {canDelete && !r.is_sealed && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
                              disabled={deleteMutation.isPending}
                              onClick={() => onDelete(r)}
                            >
                              <Trash2Icon className="size-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <RoleModal
        role={selectedRole}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title="Delete Role"
        description={`Are you sure you want to delete the "${roleToDelete?.name}" role? This action cannot be undone.`}
        confirmText="Delete Role"
      />
    </div>
  );
}
