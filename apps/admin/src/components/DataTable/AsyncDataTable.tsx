'use client';

import { Suspense, ReactNode } from 'react';
import { DataTableSkeleton } from './DataTableSkeleton';

interface AsyncDataTableWrapperProps {
  children: ReactNode;
  columns?: number;
  rows?: number;
}

/**
 * Wrapper component for async data tables with Suspense.
 * Provides a consistent loading experience.
 */
export function AsyncDataTableWrapper({
  children,
  columns = 5,
  rows = 10,
}: AsyncDataTableWrapperProps) {
  return (
    <Suspense fallback={<DataTableSkeleton columns={columns} rows={rows} />}>
      {children}
    </Suspense>
  );
}
