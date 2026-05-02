"use client";

import { use, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { CheckIcon, SaveIcon, ArrowLeftIcon, ShieldAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { getRoleById, updateRolePermissions } from "@/lib/roles";
import { listPermissions } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { ApiError, Permission } from "@/types";

export default function RolePermissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const roleId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { can, isLoading: authLoading } = useAuth();
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleQuery = useQuery({
    queryKey: ["roles", roleId],
    queryFn: async () => {
      const role = await getRoleById(roleId);
      // Initialize selection from existing permissions
      setSelectedIds(role.permissions?.map((p) => p.id) ?? []);
      return role;
    },
    enabled: !!roleId,
  });

  const permsQuery = useQuery({
    queryKey: ["permissions"],
    queryFn: listPermissions,
  });

  const mutation = useMutation({
    mutationFn: (ids: number[]) => updateRolePermissions(roleId, ids),
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["roles", roleId] });
      // Also invalidate the current user query because their permissions might have changed if they hold this role
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (err) => {
      if (isAxiosError<ApiError>(err)) {
        setError(err.response?.data?.message ?? "Failed to update permissions.");
      } else {
        setError("An unexpected error occurred.");
      }
    },
  });

  // Group permissions by resource for the grid rows
  const matrix = useMemo(() => {
    if (!permsQuery.data) return null;
    const resources: Record<string, Permission[]> = {};
    const actions = new Set<string>();

    permsQuery.data.forEach((p) => {
      if (!resources[p.resource]) resources[p.resource] = [];
      resources[p.resource].push(p);
      actions.add(p.action);
    });

    return {
      resources: Object.entries(resources).sort(([a], [b]) => a.localeCompare(b)),
      actions: Array.from(actions).sort(),
    };
  }, [permsQuery.data]);

  const togglePermission = (id: number) => {
    setSuccess(false);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    mutation.mutate(selectedIds);
  };

  if (authLoading || roleQuery.isLoading || permsQuery.isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading permission matrix...</div>;
  }

  if (!can("edit", "role")) {
    return <div className="p-8 text-center text-destructive">Unauthorized</div>;
  }

  const role = roleQuery.data;
  if (!role) return <div className="p-8 text-center">Role not found</div>;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeftIcon className="size-4 mr-1" />
          Back to Roles
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Permission Matrix: {role.name}</CardTitle>
            <CardDescription>
              {role.is_sealed 
                ? "This is a system role. Permissions are fixed and cannot be modified."
                : `Configure what users with the "${role.name}" role are allowed to do.`}
            </CardDescription>
          </div>
          {!role.is_sealed && (
            <Button 
              onClick={handleSave} 
              disabled={mutation.isPending || selectedIds.length === (role.permissions?.length ?? 0) && selectedIds.every(id => role.permissions?.some(p => p.id === id))}
              className="gap-2"
            >
              <SaveIcon className="size-4" />
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <ShieldAlertIcon className="size-5 text-destructive mt-0.5" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200 flex items-start gap-3">
              <CheckIcon className="size-5 text-green-600 mt-0.5" />
              <p className="text-sm text-green-700 font-medium">Permissions updated successfully.</p>
            </div>
          )}

          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="p-4 text-left font-semibold border-r w-48">Resource</th>
                  {matrix?.actions.map((action) => (
                    <th key={action} className="p-4 text-center font-semibold capitalize min-w-[100px]">
                      {action}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix?.resources.map(([resource, perms]) => (
                  <tr key={resource} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium border-r bg-muted/5 capitalize">
                      {resource.replace(/_/g, ' ')}
                    </td>
                    {matrix.actions.map((action) => {
                      const perm = perms.find((p) => p.action === action);
                      if (!perm) {
                        return <td key={action} className="p-4 text-center text-muted-foreground/30">—</td>;
                      }
                      
                      return (
                        <td key={action} className="p-4 text-center">
                          <div className="flex justify-center">
                            <Checkbox 
                              checked={selectedIds.includes(perm.id)}
                              onCheckedChange={() => togglePermission(perm.id)}
                              disabled={role.is_sealed || mutation.isPending}
                              aria-label={`${action} ${resource}`}
                              className="size-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
