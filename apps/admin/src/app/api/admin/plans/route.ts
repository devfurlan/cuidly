import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';
import { CreatePlanSchema } from '@/schemas/planSchemas';
import { logAudit } from '@/utils/auditLog';
import { Prisma } from '@prisma/client';

/**
 * GET /api/admin/plans
 * Lista todos os planos
 * Query params:
 *   - type: 'FAMILY' | 'NANNY' (opcional)
 *   - status: 'active' | 'inactive' | 'all' (default: 'all')
 */
async function handleGet(request: Request) {
  try {
    await requirePermission('SUBSCRIPTIONS');

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'all';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (type === 'FAMILY' || type === 'NANNY') {
      where.type = type;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const plans = await prisma.plan.findMany({
      where,
      orderBy: [{ type: 'asc' }, { price: 'asc' }],
    });

    // Adicionar preco como numero
    const plansWithPrice = plans.map((plan) => ({
      ...plan,
      price: Number(plan.price),
    }));

    return NextResponse.json({ plans: plansWithPrice });
  } catch (error) {
    console.error('Error fetching plans:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar planos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/plans
 * Cria um novo plano
 */
async function handlePost(request: Request) {
  try {
    await requirePermission('SUBSCRIPTIONS');

    const body = await request.json();
    const validationResult = CreatePlanSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const plan = await prisma.plan.create({
      data: {
        name: data.name,
        type: data.type,
        price: data.price,
        billingCycle: data.billingCycle,
        features: data.features as Prisma.InputJsonValue,
        isActive: data.isActive,
      },
    });

    await logAudit({
      action: 'CREATE',
      table: 'plans',
      recordId: plan.id,
      data: {
        name: plan.name,
        type: plan.type,
        price: Number(plan.price),
        billingCycle: plan.billingCycle,
      },
    });

    return NextResponse.json(
      { plan: { ...plan, price: Number(plan.price) } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating plan:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao criar plano';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);
