/**
 * Cryptographic utilities for sensitive data (CPF, etc.)
 *
 * Uses AES-256-GCM for encryption (can decrypt) and SHA-256 for hashing (one-way).
 */
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const key = process.env.CPF_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('CPF_ENCRYPTION_KEY environment variable is not set');
  }
  if (key.length !== 64) {
    throw new Error('CPF_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)');
  }
  return Buffer.from(key, 'hex');
}

/**
 * Encrypts a CPF using AES-256-GCM.
 * Returns a string in the format: iv:authTag:encryptedData (all in hex)
 */
export function encryptCpf(cpf: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(cpf, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a CPF that was encrypted with encryptCpf.
 * Expects the format: iv:authTag:encryptedData (all in hex)
 */
export function decryptCpf(encryptedCpf: string): string {
  const key = getEncryptionKey();
  const parts = encryptedCpf.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted CPF format');
  }

  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Creates a SHA-256 hash of the CPF.
 * Used for uniqueness checks without needing to decrypt all CPFs.
 */
export function hashCpf(cpf: string): string {
  return crypto.createHash('sha256').update(cpf).digest('hex');
}

/**
 * Masks a CPF for display (e.g., "123.456.789-00" -> "***.456.789-**")
 */
export function maskCpf(cpf: string): string {
  // Remove non-digits
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) {
    return '***.***.***-**';
  }
  // Show only middle digits
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}
