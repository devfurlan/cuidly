import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Format date to readable Brazilian Portuguese format
 * @param date - Date to format (Date object or ISO string)
 * @returns Formatted date string like "1 de Janeiro de 2024"
 */
export function formatToReadableDate(date: string | Date): string {
  return format(new Date(date), "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });
}
