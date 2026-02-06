/**
 * Get initials from a name (first and last name initials)
 * @param name - Full name
 * @returns Two-letter initials (e.g., "JS" for "John Smith")
 */
export function getInitials(name?: string): string {
  if (!name) return '';

  const words = name.split(' ').filter((word) => word.length > 0);

  if (words.length === 0) return '';

  const firstInitial = words[0][0].toUpperCase();
  const lastInitial = words[words.length - 1][0].toUpperCase();

  return `${firstInitial}${lastInitial}`;
}

/**
 * Get first and last name from full name
 * @param fullName - Full name
 * @returns First and last name capitalized
 */
export function getFirstAndLastName(fullName: string): string {
  const capitalize = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  const names = fullName.trim().split(' ');
  const firstName = capitalize(names[0]);
  const lastName = capitalize(names[names.length - 1]);
  return `${firstName} ${lastName}`;
}

export default getInitials;
