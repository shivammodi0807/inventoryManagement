"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableSkeletonProps {
  columnCount: number;
  rowCount?: number;
  searchable?: boolean;
  paged?: boolean;
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 10,
  searchable = false,
  paged = false,
}: DataTableSkeletonProps) {
  return (
    <div className="w-full space-y-3">
      {searchable && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-72" />
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {paged && (
        <div className="flex items-center justify-center pt-4">
          <Skeleton className="h-10 w-64" />
        </div>
      )}
    </div>
  );
}
