export default function getOnlyNumbers(input: string): string {
  return input.replace(/\D/g, '');
}
