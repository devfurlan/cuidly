'use client';

import { Column } from '@tanstack/react-table';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

import {
  CaretDownIcon,
  CaretUpIcon,
  CaretUpDownIcon,
} from '@phosphor-icons/react';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        '-ml-2 h-10 w-full justify-between gap-1 rounded-none',
        className,
      )}
      onClick={() => {
        const currentSort = column.getIsSorted();
        column.toggleSorting(!!(!currentSort || currentSort === 'asc'));
      }}
    >
      <span>{title}</span>
      {column.getIsSorted() === 'desc' ? (
        <CaretDownIcon className="h-4 w-4" />
      ) : column.getIsSorted() === 'asc' ? (
        <CaretUpIcon className="h-4 w-4" />
      ) : (
        <CaretUpDownIcon className="h-4 w-4" />
      )}
    </Button>
  );
}
