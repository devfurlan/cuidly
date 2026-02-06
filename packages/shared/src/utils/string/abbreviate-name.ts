/**
 * Abbreviate a name to fit within max length
 * Keeps first and last names, abbreviates middle names with initials
 * @param name - Full name to abbreviate
 * @param maxLength - Maximum length of result (default: 35)
 * @returns Abbreviated name
 */
export function abbreviateName(name: string, maxLength: number = 35): string {
  const words = name.split(' ');
  if (name.length <= maxLength) return name;

  const abbreviated = words.map((word, index) => {
    if (index === 0 || index === words.length - 1) return word;
    return word.charAt(0) + '.';
  });

  let abbreviatedName = abbreviated.join(' ');
  while (abbreviatedName.length > maxLength) {
    const middleIndex = abbreviated.findIndex(
      (word, index) =>
        word.includes('.') && index !== 0 && index !== abbreviated.length - 1
    );
    if (middleIndex === -1) break;
    abbreviated.splice(middleIndex, 1);
    abbreviatedName = abbreviated.join(' ');
  }

  return abbreviatedName;
}

export default abbreviateName;
