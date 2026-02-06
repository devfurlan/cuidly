/**
 * Format a Portuguese name with proper capitalization
 * Handles prepositions like "de", "da", "do", "dos", "das"
 * @param name - Name to format
 * @returns Properly capitalized name
 */
export function formatName(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !['de', 'da', 'do', 'dos', 'das'].includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
}
