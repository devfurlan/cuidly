/**
 * Test Factories - Minimal fixtures for business rule tests
 */
import { vi } from 'vitest';
import type { SubscriptionPlan, BillingInterval, JobStatus, BoostType, BoostSource } from '@prisma/client';

// Counter for unique IDs
let idCounter = 1;
const getNextId = () => idCounter++;
const getNextUuid = () => `uuid-${idCounter++}`;

export function resetIdCounter() {
  idCounter = 1;
}

// ============================================
// SUBSCRIPTION FACTORY
// ============================================
export interface MockSubscription {
  id: number;
  nannyId: number | null;
  familyId: number | null;
  plan: SubscriptionPlan;
  billingInterval: BillingInterval;
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE';
  paymentGateway: string;
  externalCustomerId: string | null;
  externalSubscriptionId: string | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockSubscription(overrides: Partial<MockSubscription> = {}): MockSubscription {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return {
    id: getNextId(),
    nannyId: null,
    familyId: null,
    plan: 'FAMILY_FREE',
    billingInterval: 'MONTH',
    status: 'ACTIVE',
    paymentGateway: 'ASAAS',
    externalCustomerId: null,
    externalSubscriptionId: null,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    canceledAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ============================================
// JOB (VAGA) FACTORY
// ============================================
export interface MockJob {
  id: number;
  familyId: number;
  title: string;
  description: string | null;
  jobType: string;
  schedule: Record<string, unknown>;
  requiresOvernight: string;
  contractType: string;
  benefits: string[];
  paymentType: string;
  budgetMin: number;
  budgetMax: number;
  childrenIds: number[];
  mandatoryRequirements: string[];
  allowsMultipleJobs: boolean;
  startDate: Date;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export function createMockJob(overrides: Partial<MockJob> = {}): MockJob {
  const now = new Date();
  return {
    id: getNextId(),
    familyId: 1,
    title: `Vaga de teste ${idCounter}`,
    description: null,
    jobType: 'FULL_TIME',
    schedule: {},
    requiresOvernight: 'NO',
    contractType: 'CLT',
    benefits: [],
    paymentType: 'MONTHLY',
    budgetMin: 1500,
    budgetMax: 3000,
    childrenIds: [],
    mandatoryRequirements: [],
    allowsMultipleJobs: true,
    startDate: now,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: null,
    deletedAt: null,
    ...overrides,
  };
}

// ============================================
// CONVERSATION FACTORY
// ============================================
export interface MockConversation {
  id: string;
  jobId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockConversation(overrides: Partial<MockConversation> = {}): MockConversation {
  const now = new Date();
  return {
    id: getNextUuid(),
    jobId: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ============================================
// MESSAGE FACTORY
// ============================================
export interface MockMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  deletedAt: Date | null;
  deletedBy: string | null;
}

export function createMockMessage(overrides: Partial<MockMessage> = {}): MockMessage {
  const now = new Date();
  return {
    id: getNextUuid(),
    conversationId: 'conv-1',
    senderId: 'user-1',
    body: 'Mensagem de teste',
    isRead: false,
    createdAt: now,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}

// ============================================
// BOOST FACTORY
// ============================================
export interface MockBoost {
  id: number;
  nannyId: number | null;
  jobId: number | null;
  type: BoostType;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  source: BoostSource;
  createdAt: Date;
}

export function createMockBoost(overrides: Partial<MockBoost> = {}): MockBoost {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 7);

  return {
    id: getNextId(),
    nannyId: null,
    jobId: null,
    type: 'JOB',
    startDate: now,
    endDate,
    isActive: true,
    source: 'SUBSCRIPTION',
    createdAt: now,
    ...overrides,
  };
}

// ============================================
// REVIEW FACTORY
// ============================================
export interface MockReview {
  id: number;
  familyId: number;
  nannyId: number;
  type: string;
  overallRating: number;
  comment: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  isVisible: boolean;
  createdAt: Date;
}

export function createMockReview(overrides: Partial<MockReview> = {}): MockReview {
  const now = new Date();
  return {
    id: getNextId(),
    familyId: 1,
    nannyId: 1,
    type: 'FAMILY_TO_NANNY',
    overallRating: 4.5,
    comment: 'Ótima babá!',
    isPublished: true,
    publishedAt: now,
    isVisible: true,
    createdAt: now,
    ...overrides,
  };
}

// ============================================
// USER FACTORY
// ============================================
export interface MockUser {
  id: string;
  role: 'FAMILY' | 'NANNY' | 'ADMIN';
  familyId: number | null;
  nannyId: number | null;
  name: string | null;
  email: string | null;
}

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: getNextUuid(),
    role: 'FAMILY',
    familyId: null,
    nannyId: null,
    name: 'Usuário Teste',
    email: `user${idCounter}@test.com`,
    ...overrides,
  };
}

// ============================================
// FAMILY FACTORY
// ============================================
export interface MockFamily {
  id: number;
  name: string;
  users: { id: string }[];
}

export function createMockFamily(overrides: Partial<MockFamily> = {}): MockFamily {
  return {
    id: getNextId(),
    name: `Família Teste ${idCounter}`,
    users: [],
    ...overrides,
  };
}

// ============================================
// JOB APPLICATION FACTORY
// ============================================
export interface MockJobApplication {
  id: number;
  jobId: number;
  nannyId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  matchScore: number | null;
  message: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export function createMockJobApplication(overrides: Partial<MockJobApplication> = {}): MockJobApplication {
  const now = new Date();
  return {
    id: getNextId(),
    jobId: 1,
    nannyId: 1,
    status: 'PENDING',
    matchScore: 75.5,
    message: null,
    createdAt: now,
    updatedAt: null,
    ...overrides,
  };
}

// ============================================
// TIME UTILITIES
// ============================================
export function createDateDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export function createDateDaysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function createDateMonthsAgo(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

// ============================================
// PRISMA MOCK HELPER
// ============================================
export function createPrismaMock() {
  return {
    subscription: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    job: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    conversation: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    message: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    boost: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    review: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    jobApplication: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    family: {
      findUnique: vi.fn(),
    },
  };
}
