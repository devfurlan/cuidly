import { Table } from '@tanstack/react-table';

export function getOldestAndNewestDates<TData>(
  table: Table<TData>,
  column: string,
): {
  from: Date;
  to: Date;
} {
  const dates: Date[] = table
    .getPreFilteredRowModel()
    .rows.map((row) => new Date(row.getValue(column) as string | number | Date))
    .filter((date) => !isNaN(date.getTime()));

  const minDate =
    dates.length > 0
      ? new Date(Math.min(...dates.map((date) => date.getTime())))
      : new Date();

  const maxDate =
    dates.length > 0
      ? new Date(Math.max(...dates.map((date) => date.getTime())))
      : new Date();

  return { from: minDate, to: maxDate };
}
