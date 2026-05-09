"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Users, Shield, Mail, MoreHorizontal, Pencil, Trash2, UserPlus, Fingerprint } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { deleteUser, listUsers } from "@/lib/users";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { cn } from "@/lib/utils";
import type { ApiError, User } from "@/types";

export default function UsersPage() {
  const { user: currentUser, can, isLoading: authLoading } = useAuth();
  const canView = can("view", "user");
  const canCreate = can("create", "user");
  const canEdit = can("edit", "user");
  const canDelete = can("delete", "user");
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const usersQuery = useQuery({
    queryKey: ["users", page],
    queryFn: () => listUsers(page),
    enabled: canView,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      setActionError(null);
      setConfirmOpen(false);
      setUserToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: unknown) => {
      if (isAxiosError<ApiError>(err)) {
        setActionError(
          err.response?.data?.message ??
          (err.response?.status === 403
            ? "Access denied: Administrative privileges required."
            : "Termination sequence failed."),
        );
        return;
      }
      setActionError("System anomaly detected during deletion.");
    },
  });

  if (authLoading) return null;

  if (!canView) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState
          title="Administrative Blockade"
          message="Your current credentials do not grant access to the user directory."
        />
      </div>
    );
  }

  const users = usersQuery.data?.data ?? [];
  const lastPage = usersQuery.data?.last_page ?? 1;

  const onDelete = (u: User) => {
    if (u.id === currentUser?.id) {
      setActionError("Self-termination is restricted in the current session.");
      return;
    }
    setUserToDelete(u);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Premium Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Access Control List</span>
            <div className="h-1 w-12 bg-primary/20 rounded-full mt-2" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">User Directory</h1>
          <p className="text-base text-muted-foreground font-medium">
            Provision and manage personnel access across the Qollab infrastructure.
          </p>
        </div>
        {canCreate && (
          <Button asChild className="h-11 px-6 rounded-xl font-semiboldbold gap-2 shadow-premium hover:scale-[1.02] transition-all">
            <Link href="/dashboard/settings/users/new">
              <UserPlus className="size-5" /> Provision User
            </Link>
          </Button>
        )}
      </div>

      <Card className="premium-card border-none shadow-premium overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-secondary/10 pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight">Personnel Roster</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">Verified operators with system authorization</p>
            </div>
            <div className="flex items-center gap-4">
              {actionError && (
                <p className="text-xs font-semibold text-destructive animate-pulse bg-destructive/10 px-3 py-1.5 rounded-lg border border-destructive/20">
                  {actionError}
                </p>
              )}
              <Badge className="font-semibold bg-primary/10 text-primary border-none text-[10px] uppercase tracking-widest px-3">
                {usersQuery.data?.total || 0} Operators Authorized
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {usersQuery.isLoading ? (
            <div className="p-6">
              <DataTableSkeleton columnCount={5} rowCount={8} />
            </div>
          ) : users.length === 0 ? (
            <div className="p-20 text-center">
              <Users className="mx-auto size-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-semibold text-muted-foreground">The registry is currently vacant.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-secondary/20">
                  <TableRow className="hover:bg-transparent border-border/40">
                    <TableHead className="py-5 px-6 font-semibold text-[11px] uppercase tracking-widest">Operator Identity</TableHead>
                    <TableHead className="py-5 font-semibold text-[11px] uppercase tracking-widest text-center">Authorization Level</TableHead>
                    <TableHead className="py-5 font-semibold text-[11px] uppercase tracking-widest">Connectivity Status</TableHead>
                    <TableHead className="py-5 font-semibold text-[11px] uppercase tracking-widest text-right">Operational Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} className="hover:bg-secondary/20 border-border/40 transition-colors group">
                      <TableCell className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "size-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110",
                            u.id === currentUser?.id ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary/50 text-muted-foreground border-border/40"
                          )}>
                            <Fingerprint className="size-5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-semibold text-foreground tracking-tight flex items-center gap-2">
                              {u.full_name}
                              {u.id === currentUser?.id && (
                                <Badge variant="outline" className="text-[9px] font-semibold uppercase tracking-tighter h-4 px-1.5 border-primary/30 text-primary">Self</Badge>
                              )}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                              <Mail className="size-3" />
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary border border-border/40 rounded-lg">
                          <Shield className="size-3.5 text-primary/70" />
                          <span className="text-xs font-semibold text-foreground uppercase tracking-widest">{u.role.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center gap-2">
                          <div className={cn("size-2 rounded-full", u.is_active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-muted-foreground/30")} />
                          <span className={cn("text-[10px] font-semibold uppercase tracking-widest", u.is_active ? "text-green-600" : "text-muted-foreground/60")}>
                            {u.is_active ? "Authorized" : "Deactivated"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 text-right px-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-primary/5 hover:text-primary">
                              <MoreHorizontal className="size-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/40 shadow-premium p-1.5">
                            <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 py-2">Account Lifecycle</DropdownMenuLabel>
                            {canEdit && (
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/settings/users/${u.id}/edit`} className="rounded-lg font-semibold gap-2 py-2.5 cursor-pointer">
                                  <Pencil className="size-4" /> Edit Profile
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <>
                                <DropdownMenuSeparator className="bg-border/40" />
                                <DropdownMenuItem
                                  className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg font-semibold gap-2 py-2.5 cursor-pointer"
                                  disabled={deleteMutation.isPending || u.id === currentUser?.id}
                                  onClick={() => onDelete(u)}
                                >
                                  <Trash2 className="size-4" /> Terminate Access
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {lastPage > 1 && (
            <div className="p-4 border-t border-border/40 bg-secondary/5 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="font-semibold text-[10px] uppercase tracking-widest rounded-lg h-9 border-border/60 hover:bg-secondary/40"
                disabled={page <= 1 || usersQuery.isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous Sequence
              </Button>
              <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.2em]">
                Page {page} <span className="mx-2 text-border">/</span> {lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="font-semibold text-[10px] uppercase tracking-widest rounded-lg h-9 border-border/60 hover:bg-secondary/40"
                disabled={page >= lastPage || usersQuery.isFetching}
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              >
                Next Sequence
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title="Confirm User Termination"
        description={`Are you sure you want to terminate authorization for ${userToDelete?.full_name}? This action is irreversible within the current audit scope.`}
        confirmText="Confirm Termination"
      />
    </div>
  );
}
