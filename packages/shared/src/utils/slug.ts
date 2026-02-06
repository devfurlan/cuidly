/**
 * Slug utility functions for nannies
 * Formato: {primeiro-nome}-{4-chars-aleatórios}
 * Exemplo: "Maria Silva Santos" → "maria-x7k2"
 */

/**
 * Gera um slug único baseado no nome
 */
function generateSlug(name: string): string {
  // Extrair primeiro nome
  const firstName = name.trim().split(/\s+/)[0];

  // Converter para slug
  const firstNameSlug = firstName
    .toLowerCase()
    .normalize('NFD') // Normalizar para forma decomposta
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]/g, ''); // Remover caracteres especiais

  // Gerar 4 caracteres aleatórios (a-z, 0-9)
  const randomChars = Math.random()
    .toString(36)
    .substring(2, 6)
    .padEnd(4, '0');

  return `${firstNameSlug}-${randomChars}`;
}

/**
 * Gera um slug único para nanny
 */
export function generateNannySlug(name: string): string {
  return generateSlug(name);
}

/**
 * Valida e garante que um slug é único
 * Tenta até 10 vezes gerar um slug único
 */
export async function ensureUniqueSlug(
  name: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const slug = generateNannySlug(name);
    const exists = await checkExists(slug);

    if (!exists) {
      return slug;
    }

    attempts++;
  }

  throw new Error(
    `Não foi possível gerar um slug único após ${maxAttempts} tentativas para: ${name}`
  );
}
