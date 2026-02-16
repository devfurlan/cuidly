/**
 * Test seed data - deterministic users for E2E tests.
 *
 * These users are created in the Supabase TEST project (auth) and
 * in the TEST database (Prisma) by the create-test-users script.
 */

export const TEST_USERS = {
  family: {
    email: "familia-teste@cuidly.com",
    password: "TestPass123!",
    name: "Família Teste",
    type: "FAMILY" as const,
  },
  familyPaid: {
    email: "familia-plus@cuidly.com",
    password: "TestPass123!",
    name: "Família Plus",
    type: "FAMILY" as const,
  },
  nanny: {
    email: "baba-teste@cuidly.com",
    password: "TestPass123!",
    name: "Ana Teste",
    type: "NANNY" as const,
  },
  nannyPro: {
    email: "baba-pro@cuidly.com",
    password: "TestPass123!",
    name: "Maria Pro",
    type: "NANNY" as const,
  },
  nannyForTrial: {
    email: "baba-trial@cuidly.com",
    password: "TestPass123!",
    name: "Julia Trial",
    type: "NANNY" as const,
  },
} as const;

export type TestUserKey = keyof typeof TEST_USERS;
