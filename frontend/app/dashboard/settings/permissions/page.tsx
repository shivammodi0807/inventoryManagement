"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldIcon, SearchIcon, FilterIcon } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { listPermissions } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { Badge } from "@/components/ui/badge";

export default function PermissionsPage() {
  const { can, isLoading: authLoading } = useAuth();
  const [search, setSearch] = React.useState("");

  const permsQuery = useQuery({
    queryKey: ["permissions"],
    queryFn: listPermissions,
    enabled: can("view", "permission"),
  });

  if (authLoading) return null;

  if (!can("view", "permission")) {
    return (
      <div className="mx-auto max-w-md rounded-md border border-destructive/30 bg-destructive/10 p-6">
        <h1 className="text-lg font-semibold">403 — Forbidden</h1>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to view the permission catalogue.
        </p>
      </div>
    );
  }

  const permissions = permsQuery.data ?? [];
  const filtered = permissions.filter((p) => 
    p.resource.toLowerCase().includes(search.toLowerCase()) ||
    p.action.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Permissions Catalogue</h1>
        <p className="text-muted-foreground">
          A complete list of granular actions available in the Qollab system.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter permissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Capabilities</CardTitle>
          <CardDescription>
            These permissions are used to build Roles. They represent specific system endpoints and actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permsQuery.isLoading ? (
            <DataTableSkeleton columnCount={3} rowCount={10} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No permissions match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Resource</th>
                    <th className="py-2 pr-4 font-medium">Action</th>
                    <th className="py-2 pr-4 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <ShieldIcon className="size-3.5 text-primary" />
                          <span className="font-semibold capitalize">
                            {p.resource.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="capitalize font-mono text-[10px]">
                          {p.action}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground italic">
                        {p.description || `Allow user to ${p.action} ${p.resource.replace(/_/g, ' ')}.`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
