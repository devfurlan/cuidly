import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';

export type CouponUser = {
  id: number;
  name: string;
  email: string;
  type: 'NANNY' | 'FAMILY';
  photoUrl: string | null;
};

/**
 * GET /api/coupons/users
 * Busca usuários (babás e famílias) para seleção em cupons
 * Query params:
 *   - search: busca por nome ou e-mail
 *   - type: 'nanny' | 'family' | 'all' (default: 'all')
 *   - limit: máximo de resultados (default: 50)
 */
async function handleGet(request: Request) {
  try {
    await requirePermission('COUPONS');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const users: CouponUser[] = [];

    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { emailAddress: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Buscar babás
    if (type === 'all' || type === 'nanny') {
      const nannies = await prisma.nanny.findMany({
        where: {
          status: { in: ['ACTIVE', 'PENDING'] },
          emailAddress: { not: null },
          ...searchFilter,
        },
        select: {
          id: true,
          name: true,
          emailAddress: true,
          photoUrl: true,
        },
        take: type === 'all' ? Math.floor(limit / 2) : limit,
        orderBy: { name: 'asc' },
      });

      users.push(
        ...nannies.map((n) => ({
          id: n.id,
          name: n.name || 'Babá sem nome',
          email: n.emailAddress || '',
          type: 'NANNY' as const,
          photoUrl: n.photoUrl,
        })),
      );
    }

    // Buscar famílias
    if (type === 'all' || type === 'family') {
      const families = await prisma.family.findMany({
        where: {
          status: { in: ['ACTIVE', 'PENDING'] },
          emailAddress: { not: null },
          ...searchFilter,
        },
        select: {
          id: true,
          name: true,
          emailAddress: true,
          photoUrl: true,
        },
        take: type === 'all' ? Math.floor(limit / 2) : limit,
        orderBy: { name: 'asc' },
      });

      users.push(
        ...families.map((f) => ({
          id: f.id,
          name: f.name || 'Família sem nome',
          email: f.emailAddress || '',
          type: 'FAMILY' as const,
          photoUrl: f.photoUrl,
        })),
      );
    }

    // Ordenar por nome
    users.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users for coupon:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar usuários';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
