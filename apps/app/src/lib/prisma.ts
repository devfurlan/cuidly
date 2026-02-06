import { PrismaClient } from '@cuidly/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { encryptionExtension } from './prisma-encryption-extension';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const basePrisma = new PrismaClient({ adapter });

// Adicionar extensão de criptografia para campos sensíveis (CPF)
// Só ativa se a chave de criptografia estiver configurada
const extendedPrisma = process.env.CPF_ENCRYPTION_KEY
  ? basePrisma.$extends(encryptionExtension)
  : basePrisma;

// Exportar com tipo do PrismaClient base para evitar erros de tipo de união
const prisma = extendedPrisma as typeof basePrisma;

export default prisma;
