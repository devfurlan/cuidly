import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';
import { CreateCouponSchema } from '@/schemas/couponSchemas';
import { logAudit } from '@/utils/auditLog';

/**
 * GET /api/coupons
 * Lista todos os cupons com filtros e paginação
 * Query params:
 *   - status: 'all' | 'active' | 'inactive' | 'expired'
 *   - search: busca por codigo
 *   - page: numero da pagina (default 1)
 *   - limit: itens por pagina (default 20)
 */
async function handleGet(request: Request) {
  try {
    await requirePermission('COUPONS');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      deletedAt: null,
    };

    // Status filter
    if (status === 'active') {
      where.isActive = true;
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    } else if (status === 'inactive') {
      where.isActive = false;
    } else if (status === 'expired') {
      where.endDate = { lt: now };
    }

    // Search filter
    if (search) {
      where.code = { contains: search.toUpperCase(), mode: 'insensitive' };
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { usages: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    return NextResponse.json({
      coupons,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar cupons';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/coupons
 * Cria um novo cupom
 */
async function handlePost(request: Request) {
  try {
    const admin = await requirePermission('COUPONS');

    const body = await request.json();
    const validationResult = CreateCouponSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const data = validationResult.data;

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findFirst({
      where: {
        code: data.code,
        deletedAt: null,
      },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Já existe um cupom com este código' },
        { status: 400 },
      );
    }

    // Usar transação para criar cupom e e-mails permitidos
    const coupon = await prisma.$transaction(async (tx) => {
      // Criar cupom
      const newCoupon = await tx.coupon.create({
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
          requiresCreditCard: data.requiresCreditCard,
          createdById: admin.id,
        },
      });

      // Se tem restrição de usuários, criar os registros de e-mails permitidos
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
                couponId: newCoupon.id,
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
                couponId: newCoupon.id,
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
                couponId: newCoupon.id,
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

      return newCoupon;
    });

    // Buscar cupom com relações para retornar
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
      action: 'CREATE',
      table: 'coupons',
      recordId: coupon.id,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        hasUserRestriction: coupon.hasUserRestriction,
      },
    });

    return NextResponse.json({ coupon: couponWithRelations }, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao criar cupom';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);
