import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';
import { UpdateCouponSchema } from '@/schemas/couponSchemas';
import { logAudit } from '@/utils/auditLog';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/coupons/[id]
 * Busca um cupom especifico com historico de uso
 */
async function handleGet(_request: Request, context: RouteContext) {
  try {
    await requirePermission('COUPONS');

    const { id } = await context.params;

    const coupon = await prisma.coupon.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        usages: {
          include: {
            nanny: {
              select: { id: true, name: true, emailAddress: true },
            },
            family: {
              select: { id: true, name: true, emailAddress: true },
            },
            subscription: {
              select: { id: true, plan: true },
            },
          },
          orderBy: { usedAt: 'desc' },
          take: 50,
        },
        allowedEmails: {
          include: {
            nanny: {
              select: { id: true, name: true, emailAddress: true, photoUrl: true },
            },
            family: {
              select: { id: true, name: true, emailAddress: true, photoUrl: true },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
        _count: {
          select: { usages: true, allowedEmails: true },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Cupom não encontrado' },
        { status: 404 },
      );
    }

    // Calculate stats
    const stats = await prisma.couponUsage.aggregate({
      where: { couponId: id },
      _sum: { discountAmount: true },
      _count: true,
    });

    // Transformar dados para facilitar uso no formulário
    const allowedUserIds = {
      nannyIds: coupon.allowedEmails
        .filter((e) => e.nannyId)
        .map((e) => e.nannyId!),
      familyIds: coupon.allowedEmails
        .filter((e) => e.familyId)
        .map((e) => e.familyId!),
    };

    const allowedEmails = coupon.allowedEmails
      .filter((e) => !e.nannyId && !e.familyId)
      .map((e) => e.email);

    // Usuários iniciais para o componente UserMultiSelect
    const initialUsers = coupon.allowedEmails
      .filter((e) => e.nannyId || e.familyId)
      .map((e) => {
        if (e.nanny) {
          return {
            id: e.nanny.id,
            name: e.nanny.name || 'Babá sem nome',
            email: e.nanny.emailAddress || e.email,
            type: 'NANNY' as const,
          };
        }
        if (e.family) {
          return {
            id: e.family.id,
            name: e.family.name || 'Família sem nome',
            email: e.family.emailAddress || e.email,
            type: 'FAMILY' as const,
          };
        }
        return null;
      })
      .filter(Boolean);

    return NextResponse.json({
      coupon: {
        ...coupon,
        allowedUserIds,
        allowedEmails,
      },
      initialUsers,
      stats: {
        totalUsages: stats._count,
        totalDiscountGiven: stats._sum.discountAmount || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar cupom';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/coupons/[id]
 * Atualiza um cupom
 */
async function handlePut(request: Request, context: RouteContext) {
  try {
    await requirePermission('COUPONS');

    const { id } = await context.params;
    const body = await request.json();

    const validationResult = UpdateCouponSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const data = validationResult.data;

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { error: 'Cupom não encontrado' },
        { status: 404 },
      );
    }

    // Check if code is being changed to an existing one
    if (data.code && data.code !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findFirst({
        where: {
          code: data.code,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: 'Já existe um cupom com este código' },
          { status: 400 },
        );
      }
    }

    // Usar transação para atualizar cupom e e-mails permitidos
    const coupon = await prisma.$transaction(async (tx) => {
      // Atualizar cupom
      const updatedCoupon = await tx.coupon.update({
        where: { id },
        data: {
          code: data.code,
          description: data.description,
          discountType: data.discountType,
          discountValue: data.discountValue,
          maxDiscount: data.maxDiscount,
          minPurchaseAmount: data.minPurchaseAmount,
          usageLimit: data.usageLimit,
          applicableTo: data.applicableTo,
          applicablePlanIds: data.applicablePlanIds,
          hasUserRestriction: data.hasUserRestriction,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive,
        },
      });

      // Se hasUserRestriction foi passado, recriar os e-mails permitidos
      if (data.hasUserRestriction !== undefined) {
        // Deletar todos os e-mails permitidos existentes
        await tx.couponAllowedEmail.deleteMany({
          where: { couponId: id },
        });

        // Se tem restrição de usuários, criar novos registros
        if (data.hasUserRestriction) {
          const allowedEmailsToCreate: {
            couponId: string;
            email: string;
            nannyId?: number;
            familyId?: number;
          }[] = [];

          // Buscar e-mails das babás selecionadas
          if (
            data.allowedUserIds?.nannyIds &&
            data.allowedUserIds.nannyIds.length > 0
          ) {
            const nannies = await tx.nanny.findMany({
              where: { id: { in: data.allowedUserIds.nannyIds } },
              select: { id: true, emailAddress: true },
            });

            for (const nanny of nannies) {
              if (nanny.emailAddress) {
                allowedEmailsToCreate.push({
                  couponId: id,
                  email: nanny.emailAddress.toLowerCase().trim(),
                  nannyId: nanny.id,
                });
              }
            }
          }

          // Buscar e-mails das famílias selecionadas
          if (
            data.allowedUserIds?.familyIds &&
            data.allowedUserIds.familyIds.length > 0
          ) {
            const families = await tx.family.findMany({
              where: { id: { in: data.allowedUserIds.familyIds } },
              select: { id: true, emailAddress: true },
            });

            for (const family of families) {
              if (family.emailAddress) {
                allowedEmailsToCreate.push({
                  couponId: id,
                  email: family.emailAddress.toLowerCase().trim(),
                  familyId: family.id,
                });
              }
            }
          }

          // Adicionar e-mails externos (sem usuário linkado)
          if (data.allowedEmails && data.allowedEmails.length > 0) {
            for (const email of data.allowedEmails) {
              const normalizedEmail = email.toLowerCase().trim();
              // Evitar duplicados
              if (
                !allowedEmailsToCreate.some((e) => e.email === normalizedEmail)
              ) {
                allowedEmailsToCreate.push({
                  couponId: id,
                  email: normalizedEmail,
                });
              }
            }
          }

          // Criar todos os registros de e-mails permitidos
          if (allowedEmailsToCreate.length > 0) {
            await tx.couponAllowedEmail.createMany({
              data: allowedEmailsToCreate,
            });
          }
        }
      }

      return updatedCoupon;
    });

    // Buscar cupom atualizado com relações
    const couponWithRelations = await prisma.coupon.findUnique({
      where: { id: coupon.id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { allowedEmails: true },
        },
      },
    });

    await logAudit({
      action: 'UPDATE',
      table: 'coupons',
      recordId: coupon.id,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        hasUserRestriction: coupon.hasUserRestriction,
        isActive: coupon.isActive,
      },
    });

    return NextResponse.json({ coupon: couponWithRelations });
  } catch (error) {
    console.error('Error updating coupon:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao atualizar cupom';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/coupons/[id]
 * Soft delete de um cupom
 */
async function handleDelete(_request: Request, context: RouteContext) {
  try {
    await requirePermission('COUPONS');

    const { id } = await context.params;

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { error: 'Cupom não encontrado' },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.coupon.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    await logAudit({
      action: 'DELETE',
      table: 'coupons',
      recordId: id,
      data: {
        code: existingCoupon.code,
      },
    });

    return NextResponse.json({ success: true, message: 'Cupom excluído' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao excluir cupom';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
export const PUT = withAuth(handlePut);
export const DELETE = withAuth(handleDelete);
