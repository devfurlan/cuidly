/**
 * Prisma Extension para Criptografia Automática de Campos Sensíveis
 *
 * Esta extensão intercepta operações do Prisma para automaticamente
 * criptografar dados sensíveis antes de salvar e descriptografar ao ler.
 *
 * Campos criptografados:
 * - Nanny.cpf
 * - ValidationRequest.cpf
 *
 * Usa a nova API $extends do Prisma 5+
 */

import { Prisma } from '@prisma/client';
import { encrypt, decrypt, isEncrypted, hashCpfForSearch } from './encryption';

// Modelos e campos que devem ser criptografados
const ENCRYPTED_FIELDS: Record<string, string[]> = {
  nanny: ['cpf'],
  validationRequest: ['cpf'],
};

// Campos de hash para busca (criados automaticamente)
const HASH_FIELDS: Record<string, Record<string, string>> = {
  nanny: { cpf: 'cpfHash' },
  validationRequest: { cpf: 'cpfHash' },
};

/**
 * Criptografa campos sensíveis em um objeto
 */
function encryptFields(
  modelName: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const fields = ENCRYPTED_FIELDS[modelName];
  if (!fields || !data) return data;

  const encrypted = { ...data };

  for (const field of fields) {
    if (field in encrypted && encrypted[field]) {
      const value = encrypted[field] as string;

      // Não criptografar se já estiver criptografado
      if (!isEncrypted(value)) {
        encrypted[field] = encrypt(value);

        // Adicionar hash para busca se o campo de hash existir no modelo
        const hashField = HASH_FIELDS[modelName]?.[field];
        if (hashField) {
          encrypted[hashField] = hashCpfForSearch(value);
        }
      }
    }
  }

  return encrypted;
}

/**
 * Descriptografa campos sensíveis em um objeto
 */
function decryptFields<T extends Record<string, unknown>>(
  modelName: string,
  data: T | null,
): T | null {
  if (!data) return data;

  const fields = ENCRYPTED_FIELDS[modelName];
  if (!fields) return data;

  const decrypted = { ...data };

  for (const field of fields) {
    if (field in decrypted && decrypted[field]) {
      const value = decrypted[field] as string;
      if (isEncrypted(value)) {
        (decrypted as Record<string, unknown>)[field] = decrypt(value);
      }
    }
  }

  return decrypted as T;
}

/**
 * Descriptografa arrays de resultados
 */
function decryptArray<T extends Record<string, unknown>>(
  modelName: string,
  data: T[],
): T[] {
  return data.map((item) => decryptFields(modelName, item) as T);
}

/**
 * Extensão do Prisma para criptografia automática
 */
export const encryptionExtension = Prisma.defineExtension({
  name: 'encryption',
  query: {
    nanny: {
      async create({ args, query }) {
        if (args.data) {
          args.data = encryptFields('nanny', args.data as Record<string, unknown>) as typeof args.data;
        }
        const result = await query(args);
        return decryptFields('nanny', result as Record<string, unknown>);
      },
      async createMany({ args, query }) {
        if (Array.isArray(args.data)) {
          args.data = args.data.map((item) =>
            encryptFields('nanny', item as Record<string, unknown>)
          ) as typeof args.data;
        }
        return query(args);
      },
      async update({ args, query }) {
        if (args.data) {
          args.data = encryptFields('nanny', args.data as Record<string, unknown>) as typeof args.data;
        }
        const result = await query(args);
        return decryptFields('nanny', result as Record<string, unknown>);
      },
      async updateMany({ args, query }) {
        if (args.data) {
          args.data = encryptFields('nanny', args.data as Record<string, unknown>) as typeof args.data;
        }
        return query(args);
      },
      async upsert({ args, query }) {
        if (args.create) {
          args.create = encryptFields('nanny', args.create as Record<string, unknown>) as typeof args.create;
        }
        if (args.update) {
          args.update = encryptFields('nanny', args.update as Record<string, unknown>) as typeof args.update;
        }
        const result = await query(args);
        return decryptFields('nanny', result as Record<string, unknown>);
      },
      async findUnique({ args, query }) {
        const result = await query(args);
        return decryptFields('nanny', result as Record<string, unknown> | null);
      },
      async findUniqueOrThrow({ args, query }) {
        const result = await query(args);
        return decryptFields('nanny', result as Record<string, unknown>);
      },
      async findFirst({ args, query }) {
        const result = await query(args);
        return decryptFields('nanny', result as Record<string, unknown> | null);
      },
      async findFirstOrThrow({ args, query }) {
        const result = await query(args);
        return decryptFields('nanny', result as Record<string, unknown>);
      },
      async findMany({ args, query }) {
        const result = await query(args);
        return decryptArray('nanny', result as Record<string, unknown>[]);
      },
    },
    validationRequest: {
      async create({ args, query }) {
        if (args.data) {
          args.data = encryptFields('validationRequest', args.data as Record<string, unknown>) as typeof args.data;
        }
        const result = await query(args);
        return decryptFields('validationRequest', result as Record<string, unknown>);
      },
      async update({ args, query }) {
        if (args.data) {
          args.data = encryptFields('validationRequest', args.data as Record<string, unknown>) as typeof args.data;
        }
        const result = await query(args);
        return decryptFields('validationRequest', result as Record<string, unknown>);
      },
      async upsert({ args, query }) {
        if (args.create) {
          args.create = encryptFields('validationRequest', args.create as Record<string, unknown>) as typeof args.create;
        }
        if (args.update) {
          args.update = encryptFields('validationRequest', args.update as Record<string, unknown>) as typeof args.update;
        }
        const result = await query(args);
        return decryptFields('validationRequest', result as Record<string, unknown>);
      },
      async findUnique({ args, query }) {
        const result = await query(args);
        return decryptFields('validationRequest', result as Record<string, unknown> | null);
      },
      async findFirst({ args, query }) {
        const result = await query(args);
        return decryptFields('validationRequest', result as Record<string, unknown> | null);
      },
      async findMany({ args, query }) {
        const result = await query(args);
        return decryptArray('validationRequest', result as Record<string, unknown>[]);
      },
    },
  },
});

export default encryptionExtension;
