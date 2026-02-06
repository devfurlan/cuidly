import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type DateFormatType = 'date' | 'datetime' | 'time' | 'longDate' | 'iso';

/**
 * Convert date to Brasilia timezone and format it
 * @param inputDate - Date to convert (Date object or ISO string)
 * @param formatType - Type of format to apply
 * @returns Formatted date string in Brazilian Portuguese
 */
export function convertToBrasiliaDateTime(
  inputDate: string | Date,
  formatType: DateFormatType = 'date'
): string {
  const date = new Date(inputDate);
  const zoned = new Date(
    date.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
  );

  switch (formatType) {
    case 'datetime':
      return format(zoned, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    case 'time':
      return format(zoned, 'HH:mm', { locale: ptBR });
    case 'longDate':
      return format(zoned, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    case 'iso':
      return format(zoned, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", { locale: ptBR });
    default:
      return format(zoned, 'dd/MM/yyyy', { locale: ptBR });
  }
}

export default convertToBrasiliaDateTime;
