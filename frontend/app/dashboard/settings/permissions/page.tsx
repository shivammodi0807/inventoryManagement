"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Search, ShieldCheck, Key } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { listPermissions } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/shared/error-state";
import { cn } from "@/lib/utils";

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
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState
          title="Access Restricted"
          message="Catalogue access requires cryptographic authorization from the system administrator."
        />
      </div>
    );
  }

  const permissions = permsQuery.data ?? [];
  const filtered = permissions.filter(
    (p) =>
      p.resource.toLowerCase().includes(search.toLowerCase()) ||
      p.action.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Premium Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Key className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">
              Security Registry
            </span>
            <div className="h-1 w-12 bg-primary/20 rounded-full mt-2" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Permissions Catalogue
          </h1>
          <p className="text-base text-muted-foreground font-medium">
            A granular audit of atomic capabilities available across the Qollab
            infrastructure.
          </p>
        </div>
        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Search capability..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-secondary/20 border-border/40 focus:bg-background transition-all font-medium"
          />
        </div>
      </div>

      <Card className="premium-card border-none shadow-premium overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-secondary/10 pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight">
                Capability Ledger
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">
                Atomic access tokens used for role construction
              </p>
            </div>
            <Badge className="font-semibold bg-primary/10 text-primary border-none text-[10px] uppercase tracking-widest px-3">
              {filtered.length} System Keys
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {permsQuery.isLoading ? (
            <div className="p-6">
              <DataTableSkeleton columnCount={3} rowCount={10} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-20 text-center">
              <Shield className="mx-auto size-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-semibold text-muted-foreground">
                No matching capabilities found in the registry.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/30 border-b border-border/40">
                    <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                      Resource Target
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                      Access Definition
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                      Operation Key
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="group hover:bg-primary/[0.02] transition-colors border-b border-border/40 last:border-0"
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="size-4.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                              {p.resource.replace(/_/g, " ")}
                            </p>
                            <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-tighter">
                              Target: QLL-SYS-RES-{p.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize font-semibold text-[10px] px-2.5 py-0.5 rounded-md border-none tracking-widest",
                            p.action === "view"
                              ? "bg-blue-500/10 text-blue-600"
                              : p.action === "create"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : p.action === "edit"
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-rose-500/10 text-rose-600",
                          )}
                        >
                          {p.action}
                        </Badge>
                      </td>
                      <td className="py-5 px-6">
                        <p className="text-sm text-muted-foreground font-medium italic leading-relaxed max-w-lg">
                          {p.description ||
                            `Authorization to perform ${p.action} operations on ${p.resource.replace(/_/g, " ")} entities.`}
                        </p>
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
