/**
 * Slug utility functions
 */

/**
 * Generates a URL-friendly slug from a full name
 * Format: {first-name}-{4-random-chars}
 * Example: "Maria Silva Santos" → "maria-a8k3"
 *
 * @param name - The full name to convert to slug
 * @returns A unique slug with first name and 4 random characters
 */
export function generateSlug(name?: string | null): string {
  // Extract first name or use fallback
  const firstName = name?.trim().split(/\s+/)[0] || 'baba';

  // Convert first name to slug format
  const firstNameSlug = firstName
    .toLowerCase()
    .normalize('NFD') // Normalize to decomposed form
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
    .replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric characters

  // Generate 4 random alphanumeric characters (lowercase letters + numbers)
  const randomChars = Math.random()
    .toString(36) // Base 36 (0-9, a-z)
    .substring(2, 6) // Take 4 characters
    .padEnd(4, '0'); // Ensure 4 characters (fallback if random is short)

  return `${firstNameSlug}-${randomChars}`;
}

/**
 * Generates a unique slug by appending a random suffix
 * @deprecated Use generateSlug() instead - it already generates unique slugs
 * @param baseSlug - The base slug
 * @returns A unique slug with random suffix
 */
export function generateUniqueSlug(baseSlug: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Extracts the first name from a full name
 * @param fullName - The full name
 * @returns The first name
 */
export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0];
}

/**
 * Generates a URL-friendly slug from a city name
 * @param city - The city name
 * @returns A URL-friendly slug
 */
export function generateCitySlug(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates the full profile URL for a nanny
 * @param slug - The nanny's slug
 * @param city - The nanny's city (optional)
 * @returns The full profile path
 */
export function getNannyProfileUrl(slug: string, city?: string | null): string {
  const citySlug = city ? generateCitySlug(city) : 'brasil';
  return `/baba/${citySlug}/${slug}`;
}
