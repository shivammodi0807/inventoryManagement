"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ShieldCheckIcon, Trash2Icon, UserIcon, PlusIcon, PencilIcon, Shield, AlertCircle, ChevronRight, ShieldAlert } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { deleteRole, listRoles } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleModal } from "@/components/settings/role-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { ApiError, Role } from "@/types";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";

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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Access Restricted</h2>
          <p className="text-sm text-muted-foreground font-medium max-w-xs">
            You don&apos;t have the necessary administrative privileges to view or manage system roles.
          </p>
        </div>
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
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Access Control</span>
            <div className="h-1 w-12 bg-primary/20 rounded-full mt-2" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Roles & Permissions</h1>
          <p className="text-base text-muted-foreground font-medium">
            Define administrative boundaries and functional access levels.
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={openCreateModal}
            className="shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold px-6 rounded-xl h-12 gap-2"
          >
            <PlusIcon className="h-5 w-5" /> Create New Role
          </Button>
        )}
      </div>

      {actionError && (
        <div className="mx-2 flex items-center gap-3 bg-destructive/5 border border-destructive/20 p-4 rounded-2xl text-destructive text-sm font-semibold animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{actionError}</p>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-8 px-2 hover:bg-destructive/10 text-destructive"
            onClick={() => setActionError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="premium-card overflow-hidden">
        {rolesQuery.isLoading ? (
          <div className="p-6">
            <DataTableSkeleton columnCount={4} rowCount={5} />
          </div>
        ) : roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-secondary/50 flex items-center justify-center text-muted-foreground/40 mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No roles configured</h3>
            <p className="text-sm text-muted-foreground font-medium max-w-sm mb-6">
              You haven&apos;t defined any custom roles yet. Standard system roles may still be active.
            </p>
            {canCreate && (
              <Button onClick={openCreateModal} variant="outline" className="rounded-xl font-semibold">
                Create First Role
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/30 border-b border-border/40">
                  <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Resource Target</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Access Definition</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Operation Key</th>
                  <th className="py-4 px-6 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Management</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.id} className="group hover:bg-primary/[0.02] transition-colors border-b border-border/40 last:border-0">
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base text-foreground tracking-tight">{r.name}</span>
                          {r.is_sealed && (
                            <Badge className="bg-secondary/50 text-secondary-foreground border-border/50 text-[10px] uppercase font-semibold tracking-widest px-1.5 py-0">
                              System
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
                          <ShieldCheckIcon className="h-3 w-3" />
                          <span>Standard Security Policy</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xs">
                        {r.description || "No specialized scope defined for this security profile."}
                      </p>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-primary/5 text-primary px-3 py-1.5 rounded-full border border-primary/10">
                          <UserIcon className="h-3.5 w-3.5" />
                          <span className="font-semibold tabular-nums leading-none"> {r.user_count ?? 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && (
                          <Button asChild size="sm" variant="ghost" className="h-10 px-4 rounded-xl font-semibold gap-2 hover:bg-primary/5 hover:text-primary group/btn">
                            <Link href={`/dashboard/settings/roles/${r.id}`}>
                              <ShieldCheckIcon className="h-4 w-4" />
                              Permissions
                              <ChevronRight className="h-3 w-3 opacity-0 group-hover/btn:opacity-100 -translate-x-1 group-hover/btn:translate-x-0 transition-all" />
                            </Link>
                          </Button>
                        )}
                        <div className="h-4 w-px bg-border/40 mx-1" />
                        {canEdit && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 rounded-xl hover:bg-background hover:shadow-sm"
                            onClick={() => openEditModal(r)}
                          >
                            <PencilIcon className="h-4 w-4" />
                            <span className="sr-only">Edit Role</span>
                          </Button>
                        )}
                        {canDelete && !r.is_sealed && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={deleteMutation.isPending}
                            onClick={() => onDelete(r)}
                          >
                            <Trash2Icon className="h-4 w-4" />
                            <span className="sr-only">Delete Role</span>
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
      </div>

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
        title="Delete Security Profile?"
        description={`Are you sure you want to delete the "${roleToDelete?.name}" role? This will immediately revoke access for all assigned users. This action is irreversible.`}
        confirmText="Confirm Deletion"
        variant="destructive"
      />
    </div>
  );
}
