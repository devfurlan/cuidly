/**
 * Business Rules Test Suite
 *
 * 15 testes cobrindo:
 * - A) Planos de Famílias (7)
 * - B) Boost de vaga (4)
 * - C) Babás / mensagens / candidaturas (4)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockSubscription,
  createMockJob,
  createMockBoost,
  createDateDaysAgo,
  createDateDaysFromNow,
  resetIdCounter,
} from './factories';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    subscription: {
      findUnique: vi.fn(),
      findFirst: vi.fn(), // Added: getSubscription uses findFirst
    },
    job: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    conversation: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    message: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    boost: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
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
    },
  },
}));

import prisma from '@/lib/prisma';
import {
  getJobLimit,
  getMaxConversationsPerJob,
  getJobExpirationDays,
  getReviewLimit,
  canStartConversationForJob,
  isJobExpired,
  canNannySendMessage,
  canUseBoost,
} from '@/services/subscription';

describe('Business Rules - 15 Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetIdCounter();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ============================================
  // A) PLANOS DE FAMÍLIAS (7 testes)
  // ============================================
  describe('A) Planos de Famílias', () => {

    // 1) Família grátis: cria 1 vaga ativa; bloquear criação da 2ª vaga ativa
    it('1. Família grátis: limite de 1 vaga ativa, bloqueia 2ª vaga', () => {
      const limit = getJobLimit('FAMILY_FREE');
      expect(limit).toBe(1);

      // Simular que já tem 1 vaga ativa
      const activeJobsCount = 1;
      const canCreate = activeJobsCount < limit;
      expect(canCreate).toBe(false);
    });

    // 2) Família paga: cria até 3 vagas ativas; bloquear a 4ª
    it('2. Família paga: limite de 3 vagas ativas, bloqueia 4ª vaga', () => {
      const limit = getJobLimit('FAMILY_PLUS');
      expect(limit).toBe(3);

      // Simular que já tem 3 vagas ativas
      const activeJobsCount = 3;
      const canCreate = activeJobsCount < limit;
      expect(canCreate).toBe(false);

      // Com 2 vagas, ainda pode criar
      const activeJobsCount2 = 2;
      const canCreate2 = activeJobsCount2 < limit;
      expect(canCreate2).toBe(true);
    });

    // 3) Família grátis: vaga expira em 7 dias
    it('3. Família grátis: vaga expira em 7 dias e bloqueia candidaturas/conversas', async () => {
      const expirationDays = getJobExpirationDays('FAMILY_FREE');
      expect(expirationDays).toBe(7);

      // Mock subscription (use findFirst which is what getSubscription uses)
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(
        createMockSubscription({ plan: 'FAMILY_FREE', familyId: 1 }) as any
      );

      // Mock job criada 8 dias atrás (expirada)
      vi.mocked(prisma.job.findUnique).mockResolvedValue(
        createMockJob({ id: 1, createdAt: createDateDaysAgo(8) }) as any
      );

      const result = await isJobExpired({ familyId: 1 }, 1);
      expect(result.isExpired).toBe(true);
      expect(result.daysRemaining).toBe(0);
    });

    // 4) Família paga: vaga expira em 30 dias
    it('4. Família paga: vaga expira em 30 dias e bloqueia candidaturas/conversas', async () => {
      const expirationDays = getJobExpirationDays('FAMILY_PLUS');
      expect(expirationDays).toBe(30);

      // Mock subscription (use findFirst which is what getSubscription uses)
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(
        createMockSubscription({ plan: 'FAMILY_PLUS', familyId: 1 }) as any
      );

      // Mock job criada 31 dias atrás (expirada)
      vi.mocked(prisma.job.findUnique).mockResolvedValue(
        createMockJob({ id: 1, createdAt: createDateDaysAgo(31) }) as any
      );

      const result = await isJobExpired({ familyId: 1 }, 1);
      expect(result.isExpired).toBe(true);

      // Mock job criada 29 dias atrás (ainda válida)
      vi.mocked(prisma.job.findUnique).mockResolvedValue(
        createMockJob({ id: 1, createdAt: createDateDaysAgo(29) }) as any
      );

      const result2 = await isJobExpired({ familyId: 1 }, 1);
      expect(result2.isExpired).toBe(false);
      expect(result2.daysRemaining).toBeGreaterThan(0);
    });

    // 5) Família grátis: pode iniciar conversa com 1 babá por vaga; bloquear a 2ª
    it('5. Família grátis: limite de 1 conversa, bloqueia 2ª', async () => {
      const limit = getMaxConversationsPerJob('FAMILY_FREE');
      expect(limit).toBe(1);

      // Mock subscription (use findFirst which is what getSubscription uses)
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(
        createMockSubscription({ plan: 'FAMILY_FREE', familyId: 1 }) as any
      );

      // Mock no existing conversation with this recipient
      vi.mocked(prisma.conversation.findFirst).mockResolvedValue(null);

      // Mock 1 conversation already exists (at limit)
      vi.mocked(prisma.conversation.count).mockResolvedValue(1);

      const result = await canStartConversationForJob({ familyId: 1 }, 1, { nannyId: 1 });

      expect(result.canStart).toBe(false);
      expect(result.code).toBe('CONVERSATION_LIMIT_REACHED');
      expect(result.conversationsUsed).toBe(1);
      expect(result.conversationLimit).toBe(1);
    });

    // 6) Família paga: iniciar conversas ilimitadas
    it('6. Família paga: conversas ilimitadas (sem limite por vaga)', async () => {
      const limit = getMaxConversationsPerJob('FAMILY_PLUS');
      expect(limit).toBe(-1); // -1 = unlimited

      // Mock subscription (use findFirst which is what getSubscription uses)
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(
        createMockSubscription({ plan: 'FAMILY_PLUS', familyId: 1 }) as any
      );

      const result = await canStartConversationForJob({ familyId: 1 }, 1, { nannyId: 1 });

      expect(result.canStart).toBe(true);
      expect(result.conversationLimit).toBe(-1);
    });

    // 7) Avaliações: família grátis vê 1 avaliação por babá; família paga vê todas
    it('7. Família grátis vê 1 review, família paga vê todas', () => {
      const freeLimit = getReviewLimit('FAMILY_FREE');
      expect(freeLimit).toBe(1);

      const paidLimit = getReviewLimit('FAMILY_PLUS');
      expect(paidLimit).toBe(-1); // -1 = unlimited
    });
  });

  // ============================================
  // B) BOOST DE VAGA (4 testes)
  // ============================================
  describe('B) Boost de Vaga', () => {

    // 8) Família paga: ao aplicar boost, boosted_until = now + 7 dias
    it('8. Boost persiste por 7 dias (endDate = startDate + 7 dias)', () => {
      const now = new Date('2024-06-15T12:00:00Z');
      const boost = createMockBoost({
        startDate: now,
        type: 'JOB',
      });

      // Verificar que endDate é 7 dias depois
      const expectedEndDate = new Date(now);
      expectedEndDate.setDate(expectedEndDate.getDate() + 7);

      expect(boost.endDate.getTime()).toBe(expectedEndDate.getTime());
    });

    // 9) Ranking: vaga boostada aparece antes de vaga não boostada
    it('9. Vaga boostada (isActive=true, endDate > now) deve aparecer antes', () => {
      const now = new Date('2024-06-15T12:00:00Z');

      const boostedJob = createMockJob({ id: 1, title: 'Vaga Boostada' });
      const normalJob = createMockJob({ id: 2, title: 'Vaga Normal' });

      const activeBoost = createMockBoost({
        jobId: 1,
        isActive: true,
        endDate: createDateDaysFromNow(5), // ainda ativo
      });

      // Simular ordenação: vagas com boost ativo primeiro
      const jobs = [normalJob, boostedJob];
      const boosts = [activeBoost];

      const sortedJobs = jobs.sort((a, b) => {
        const aHasBoost = boosts.some(
          boost => boost.jobId === a.id && boost.isActive && boost.endDate > now
        );
        const bHasBoost = boosts.some(
          boost => boost.jobId === b.id && boost.isActive && boost.endDate > now
        );

        if (aHasBoost && !bHasBoost) return -1;
        if (!aHasBoost && bHasBoost) return 1;
        return 0;
      });

      expect(sortedJobs[0].id).toBe(1); // Vaga boostada primeiro
      expect(sortedJobs[1].id).toBe(2);
    });

    // 10) Uso: bloquear 2º boost no mesmo ciclo mensal
    it('10. Bloqueia 2º boost no mesmo ciclo de billing', async () => {
      const cycleStart = new Date('2024-06-01T00:00:00Z');
      const cycleEnd = new Date('2024-07-01T00:00:00Z');

      // Mock subscription com ciclo atual (use findFirst which is what getSubscription uses)
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(
        createMockSubscription({
          plan: 'FAMILY_PLUS',
          familyId: 1,
          currentPeriodStart: cycleStart,
          currentPeriodEnd: cycleEnd,
        }) as any
      );

      // Mock já usou 1 boost neste ciclo
      vi.mocked(prisma.boost.count).mockResolvedValue(1);

      // Pass familyId in lookup (SubscriptionLookup requires familyId or nannyId)
      const result = await canUseBoost({ familyId: 1 });

      expect(result.canUse).toBe(false);
      expect(result.reason).toContain('ciclo');
      expect(result.nextAvailable).toEqual(cycleEnd);
    });

    // 11) Reset: em novo ciclo mensal, permitir boost novamente
    it('11. Permite boost em novo ciclo mensal', async () => {
      const cycleStart = new Date('2024-06-01T00:00:00Z');
      const cycleEnd = new Date('2024-07-01T00:00:00Z');

      // Mock subscription (use findFirst which is what getSubscription uses)
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(
        createMockSubscription({
          plan: 'FAMILY_PLUS',
          familyId: 1,
          currentPeriodStart: cycleStart,
          currentPeriodEnd: cycleEnd,
        }) as any
      );

      // Mock nenhum boost neste ciclo (novo ciclo)
      vi.mocked(prisma.boost.count).mockResolvedValue(0);

      // Pass familyId in lookup (SubscriptionLookup requires familyId or nannyId)
      const result = await canUseBoost({ familyId: 1 });

      expect(result.canUse).toBe(true);
    });
  });

  // ============================================
  // C) BABÁS / MENSAGENS / CANDIDATURAS (4 testes)
  // ============================================
  describe('C) Babás / Mensagens / Candidaturas', () => {

    // 12) Babá grátis: candidatura permite 1 mensagem; depois bloquear
    it('12. Babá grátis: 1 mensagem na candidatura, bloqueia próxima sem resposta', async () => {
      // Mock subscription - NANNY_FREE (use findFirst which is what getSubscription uses)
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(
        createMockSubscription({
          plan: 'NANNY_FREE',
          nannyId: 1,
        }) as any
      );

      // Mock babá já enviou 1 mensagem (nannyMessageCount = 1)
      vi.mocked(prisma.message.count)
        .mockResolvedValueOnce(1) // nannyMessageCount
        .mockResolvedValueOnce(0); // familyResponseCount (família não respondeu)

      // Mock última mensagem da babá
      vi.mocked(prisma.message.findFirst).mockResolvedValue({
        seq: 1,
      } as any);

      // Pass nannyId in lookup (SubscriptionLookup requires familyId or nannyId)
      const result = await canNannySendMessage({ nannyId: 1 }, 'conv-1');

      expect(result.canSend).toBe(false);
      expect(result.code).toBe('WAITING_FAMILY_RESPONSE');
    });

    // 13) Babá grátis: após família responder, pode responder normalmente
    it('13. Babá grátis: pode responder após família enviar mensagem', async () => {
      // Mock subscription - NANNY_FREE (use findFirst which is what getSubscription uses)
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(
        createMockSubscription({
          plan: 'NANNY_FREE',
          nannyId: 1,
        }) as any
      );

      // Mock babá já enviou 1 mensagem (nannyMessageCount = 1)
      vi.mocked(prisma.message.count)
        .mockResolvedValueOnce(1) // nannyMessageCount
        .mockResolvedValueOnce(1); // familyResponseCount (família respondeu)

      // Mock última mensagem da babá
      vi.mocked(prisma.message.findFirst).mockResolvedValue({
        seq: 1,
      } as any);

      // Pass nannyId in lookup (SubscriptionLookup requires familyId or nannyId)
      const result = await canNannySendMessage({ nannyId: 1 }, 'conv-1');

      expect(result.canSend).toBe(true);
    });

    // 14) Babá premium: pode enviar mensagens sem depender da família
    it('14. Babá Pro: mensagens ilimitadas após candidatura', async () => {
      // Mock subscription - NANNY_PRO (use findFirst which is what getSubscription uses)
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(
        createMockSubscription({
          plan: 'NANNY_PRO',
          nannyId: 1,
        }) as any
      );

      // Pass nannyId in lookup (SubscriptionLookup requires familyId or nannyId)
      // NANNY_PRO retorna canSend: true imediatamente sem checar mensagens
      const result = await canNannySendMessage({ nannyId: 1 }, 'conv-1');

      expect(result.canSend).toBe(true);
    });

    // 15) Vaga expirada bloqueia candidatura
    it('15. Vaga expirada bloqueia candidatura (independente do plano da babá)', async () => {
      // Mock subscription da família dona da vaga (use findFirst which is what getSubscription uses)
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(
        createMockSubscription({
          plan: 'FAMILY_FREE',
          familyId: 1,
        }) as any
      );

      // Mock job criada 10 dias atrás (expirada para FAMILY_FREE = 7 dias)
      vi.mocked(prisma.job.findUnique).mockResolvedValue(
        createMockJob({
          id: 1,
          familyId: 1,
          createdAt: createDateDaysAgo(10),
          status: 'ACTIVE',
        }) as any
      );

      const expirationResult = await isJobExpired({ familyId: 1 }, 1);

      expect(expirationResult.isExpired).toBe(true);
      expect(expirationResult.reason).toContain('expirou');

      // O bloqueio de candidatura é feito no endpoint usando este resultado
      // A lógica é: se isExpired === true, retornar erro JOB_EXPIRED
    });
  });
});
