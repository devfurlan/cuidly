import { parseDateToLocal } from './parseDateToLocal';

export function formatDateToChart(value: string, timeRange: string): string {
  if (timeRange === '90d') {
    const [year, month] = value.split('-');
    const monthNames = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    const monthIndex = parseInt(month, 10) - 1;
    const formattedMonth = monthNames[monthIndex] || 'Invalid';
    return `${formattedMonth}/${year.slice(-2)}`;
  }

  if (timeRange === '30d') {
    const [yearMonth, week] = value.split('-W');
    const [year, month] = yearMonth.split('-');
    const monthNames = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];
    const monthIndex = parseInt(month, 10) - 1;
    const formattedMonth =
      monthIndex >= 0 && monthIndex < monthNames.length
        ? monthNames[monthIndex]
        : 'Invalid';
    return `${week}S ${formattedMonth}/${year.slice(-2)}`;
  }

  const date = parseDateToLocal(value);
  return date.toLocaleDateString('pt-BR');
}
