/**
 * Utilitário de Criptografia para Dados Sensíveis (PII)
 *
 * Usa AES-256-GCM para criptografar dados sensíveis como CPF.
 * A chave de criptografia deve ser armazenada de forma segura em variável de ambiente.
 *
 * IMPORTANTE:
 * - Nunca commite a chave de criptografia
 * - Use uma chave diferente para cada ambiente (dev, staging, prod)
 * - Faça backup seguro da chave - perder a chave = perder os dados
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // Para AES, são 16 bytes
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Obtém a chave de criptografia do ambiente
 * A chave deve ter 32 bytes (256 bits) para AES-256
 */
function getEncryptionKey(): Buffer {
  const key = process.env.CPF_ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      'CPF_ENCRYPTION_KEY não configurada. Defina uma chave de 64 caracteres hex (32 bytes) nas variáveis de ambiente.',
    );
  }

  // A chave deve ser fornecida em formato hex (64 caracteres = 32 bytes)
  if (key.length !== 64) {
    throw new Error(
      'CPF_ENCRYPTION_KEY deve ter exatamente 64 caracteres hex (32 bytes para AES-256)',
    );
  }

  return Buffer.from(key, 'hex');
}

/**
 * Criptografa dados sensíveis usando AES-256-GCM
 *
 * @param plaintext - Texto a ser criptografado
 * @returns String criptografada no formato: iv:authTag:ciphertext (tudo em hex)
 *
 * @example
 * ```typescript
 * const encrypted = encrypt('123.456.789-00');
 * // Resultado: "a1b2c3...:d4e5f6...:g7h8i9..."
 * ```
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    return '';
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Formato: iv:authTag:ciphertext
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Descriptografa dados criptografados com encrypt()
 *
 * @param encryptedData - String no formato iv:authTag:ciphertext
 * @returns Texto original descriptografado
 *
 * @example
 * ```typescript
 * const cpf = decrypt(encryptedCpf);
 * // Resultado: "123.456.789-00"
 * ```
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) {
    return '';
  }

  // Verificar se parece ser um dado criptografado (formato iv:authTag:ciphertext)
  if (!encryptedData.includes(':')) {
    // Pode ser um CPF em texto plano (dados antigos)
    // Retornar como está para compatibilidade
    return encryptedData;
  }

  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    // Formato inválido, retornar como está
    return encryptedData;
  }

  const [ivHex, authTagHex, ciphertext] = parts;

  // Verificar se parece ser dados criptografados válidos (IV e authTag com tamanho correto)
  if (ivHex.length !== IV_LENGTH * 2 || authTagHex.length !== AUTH_TAG_LENGTH * 2) {
    // Não é um formato de criptografia válido, retornar como está
    return encryptedData;
  }

  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // Se falhar a descriptografia, pode ser dado corrompido ou chave errada
    // Log para debug mas retorna o valor original para não quebrar a aplicação
    console.warn('Failed to decrypt value, returning as-is:', error instanceof Error ? error.message : error);
    return encryptedData;
  }
}

/**
 * Verifica se um valor está criptografado
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;

  const parts = value.split(':');
  if (parts.length !== 3) return false;

  // Verificar se as partes têm o tamanho esperado em hex
  const [iv, authTag] = parts;
  return iv.length === IV_LENGTH * 2 && authTag.length === AUTH_TAG_LENGTH * 2;
}

/**
 * Criptografa CPF de forma segura
 * Remove formatação antes de criptografar para consistência
 */
export function encryptCpf(cpf: string): string {
  if (!cpf) return '';

  // Remover formatação (pontos e traços)
  const cleanCpf = cpf.replace(/[.\-]/g, '');

  // Validar formato básico
  if (!/^\d{11}$/.test(cleanCpf)) {
    throw new Error('CPF inválido');
  }

  return encrypt(cleanCpf);
}

/**
 * Descriptografa CPF
 * Retorna sem formatação (apenas números)
 */
export function decryptCpf(encryptedCpf: string): string {
  if (!encryptedCpf) return '';
  return decrypt(encryptedCpf);
}

/**
 * Retorna CPF mascarado para exibição
 * Formato: ***.456.789-**
 */
export function maskCpf(cpf: string): string {
  if (!cpf) return '';

  // Se estiver criptografado, descriptografar primeiro
  const decrypted = isEncrypted(cpf) ? decrypt(cpf) : cpf;

  // Remover formatação
  const clean = decrypted.replace(/[.\-]/g, '');

  if (clean.length !== 11) return '***.***.***-**';

  // Mascarar primeiro e último bloco
  return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
}

/**
 * Gera uma nova chave de criptografia segura
 * Use apenas uma vez para gerar a chave inicial
 *
 * @returns Chave em formato hex de 64 caracteres
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash de CPF para busca (permite buscar sem descriptografar todos)
 * Usa SHA-256 com salt fixo por ambiente
 */
export function hashCpfForSearch(cpf: string): string {
  if (!cpf) return '';

  const salt = process.env.CPF_HASH_SALT || 'default-salt-change-in-production';
  const cleanCpf = cpf.replace(/[.\-]/g, '');

  return crypto.createHash('sha256').update(salt + cleanCpf).digest('hex');
}

export default {
  encrypt,
  decrypt,
  isEncrypted,
  encryptCpf,
  decryptCpf,
  maskCpf,
  generateEncryptionKey,
  hashCpfForSearch,
};
