import { withPermission } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { UpdatePlanSchema } from '@/schemas/planSchemas';
import { auditService } from '@/services/auditService';
import { Prisma } from '@prisma/client';
import { UserWithPermissions } from '@/lib/auth/checkPermission';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/plans/[id]
 * Retorna os detalhes de um plano especifico
 */
async function handleGet(
  _request: Request,
  context: RouteContext | undefined,
  _admin: UserWithPermissions
) {
  try {
    const { id } = await context!.params;
    const planId = parseInt(id);

    if (isNaN(planId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      plan: {
        ...plan,
        price: Number(plan.price),
      },
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar plano';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/plans/[id]
 * Atualiza um plano existente
 */
async function handlePut(
  request: Request,
  context: RouteContext | undefined,
  _admin: UserWithPermissions
) {
  try {
    const { id } = await context!.params;
    const planId = parseInt(id);

    if (isNaN(planId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const existingPlan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const validationResult = UpdatePlanSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Preparar dados para atualizacao
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.billingCycle !== undefined) updateData.billingCycle = data.billingCycle;
    if (data.features !== undefined) updateData.features = data.features as Prisma.InputJsonValue;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const plan = await prisma.plan.update({
      where: { id: planId },
      data: updateData,
    });

    await auditService.logPlanUpdate(
      plan.id,
      {
        name: existingPlan.name,
        type: existingPlan.type,
        price: Number(existingPlan.price),
        billingCycle: existingPlan.billingCycle,
        isActive: existingPlan.isActive,
        features: existingPlan.features,
      },
      {
        name: plan.name,
        type: plan.type,
        price: Number(plan.price),
        billingCycle: plan.billingCycle,
        isActive: plan.isActive,
        features: plan.features,
      }
    );

    return NextResponse.json({ plan: { ...plan, price: Number(plan.price) } });
  } catch (error) {
    console.error('Error updating plan:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao atualizar plano';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/plans/[id]
 * Desativa um plano (soft delete - apenas muda isActive para false)
 */
async function handleDelete(
  _request: Request,
  context: RouteContext | undefined,
  _admin: UserWithPermissions
) {
  try {
    const { id } = await context!.params;
    const planId = parseInt(id);

    if (isNaN(planId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const existingPlan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    // Soft delete - apenas desativar
    const plan = await prisma.plan.update({
      where: { id: planId },
      data: { isActive: false },
    });

    await auditService.logPlanDelete(plan.id, {
      name: existingPlan.name,
      type: existingPlan.type,
      price: Number(existingPlan.price),
      billingCycle: existingPlan.billingCycle,
      wasActive: existingPlan.isActive,
    });

    return NextResponse.json({
      message: 'Plano desativado com sucesso',
      plan: { ...plan, price: Number(plan.price) },
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao desativar plano';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withPermission('SUBSCRIPTIONS', handleGet);
export const PUT = withPermission('SUBSCRIPTIONS', handlePut);
export const DELETE = withPermission('SUBSCRIPTIONS', handleDelete);
