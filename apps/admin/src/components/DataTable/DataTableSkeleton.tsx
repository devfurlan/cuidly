'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableSkeletonProps {
  columns?: number;
  rows?: number;
  showToolbar?: boolean;
  showPagination?: boolean;
}

/**
 * Skeleton loading state for DataTable.
 * Provides a consistent loading experience across all tables.
 */
export function DataTableSkeleton({
  columns = 5,
  rows = 10,
  showToolbar = true,
  showPagination = true,
}: DataTableSkeletonProps) {
  return (
    <div className="space-y-4">
      {showToolbar && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
          <Skeleton className="h-8 w-[100px]" />
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i} className="h-auto px-2 py-3 first:ps-4 last:pe-4">
                  <Skeleton className="h-4 w-full max-w-[120px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, cellIndex) => (
                  <TableCell
                    key={cellIndex}
                    className="px-2 py-3 first:ps-4 last:pe-4"
                  >
                    <Skeleton
                      className="h-4 w-full"
                      style={{
                        maxWidth: `${60 + Math.random() * 60}px`,
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-[200px]" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-[80px]" />
            <Skeleton className="h-8 w-[60px]" />
            <Skeleton className="h-8 w-[80px]" />
          </div>
        </div>
      )}
    </div>
  );
}
