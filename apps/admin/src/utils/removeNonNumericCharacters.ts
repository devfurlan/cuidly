export function removeNonNumericCharacters(input: string): string {
  return input.replace(/\D/g, '');
}
