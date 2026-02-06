import { ValueType } from 'recharts/types/component/DefaultTooltipContent';

export function formatToBRL(
  value: number | ValueType,
  showCents = false,
): string {
  const valueParsed = typeof value === 'number' ? value : Number(value);
  return valueParsed.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: showCents ? 2 : 0,
  });
}
