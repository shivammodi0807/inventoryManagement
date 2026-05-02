"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Loader2, Ruler } from "lucide-react";
import { useState } from "react";

import { getUnits } from "@/lib/inventory";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { UnitModal } from "@/components/inventory/unit-modal";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";

export default function UnitsPage() {
  const { can } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: units,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["units"],
    queryFn: () => getUnits(),
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Units of Measure
          </h1>
          <p className="text-muted-foreground">
            Define how your products are quantified (e.g. pieces, kg, boxes).
          </p>
        </div>
        {can("create", "unit") && (
          <>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Button>
            <UnitModal open={isModalOpen} onOpenChange={setIsModalOpen} />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Measurement Units</CardTitle>
          <CardDescription>
            System-wide units available for product definitions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columnCount={3} rowCount={5} />
          ) : isError ? (
            <ErrorState 
              title="Failed to load units" 
              onRetry={() => refetch()} 
            />
          ) : !units?.data?.length ? (
            <EmptyState
              title="No units found"
              description="Define measurement units to quantify your products."
              icon={<Ruler className="h-10 w-10 text-muted-foreground" />}
              action={can("create", "unit") ? {
                label: "Add Unit",
                onClick: () => setIsModalOpen(true)
              } : undefined}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Abbreviation</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.data.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        {unit.name}
                      </div>
                    </TableCell>
                    <TableCell>{unit.abbreviation}</TableCell>
                    <TableCell>
                      {new Date(unit.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
