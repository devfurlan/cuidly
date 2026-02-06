import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { canFavorite } from '@/services/subscription';
import { getFirstName } from '@/utils/slug';

/**
 * GET /api/favorites - Listar favoritos da família
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json(
        { error: 'Apenas famílias podem acessar favoritos' },
        { status: 403 }
      );
    }

    const favorites = await prisma.favorite.findMany({
      where: { familyId: currentUser.family.id },
      include: {
        nanny: {
          select: {
            id: true,
            name: true,
            slug: true,
            photoUrl: true,
            experienceYears: true,
            hourlyRate: true,
            address: {
              select: {
                city: true,
                state: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Retornar apenas o primeiro nome da babá (privacidade)
    const favoritesWithFirstName = favorites.map((fav) => ({
      ...fav,
      nanny: {
        ...fav.nanny,
        name: fav.nanny.name ? getFirstName(fav.nanny.name) : '',
      },
    }));

    return NextResponse.json({ favorites: favoritesWithFirstName });
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/favorites - Adicionar aos favoritos
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json(
        { error: 'Apenas famílias podem adicionar favoritos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nannyId } = body;

    if (!nannyId) {
      return NextResponse.json(
        { error: 'nannyId é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se pode favoritar (feature do plano)
    const canFav = await canFavorite({ familyId: currentUser.family.id });

    if (!canFav) {
      return NextResponse.json(
        {
          error: 'Funcionalidade Premium',
          code: 'SUBSCRIPTION_REQUIRED',
          message: 'Assine um plano para favoritar babás'
        },
        { status: 403 }
      );
    }

    // Verificar se babá existe
    const nanny = await prisma.nanny.findUnique({
      where: { id: nannyId },
      select: { id: true },
    });

    if (!nanny) {
      return NextResponse.json(
        { error: 'Babá não encontrada' },
        { status: 404 }
      );
    }

    // Adicionar aos favoritos (upsert para evitar duplicatas)
    const favorite = await prisma.favorite.upsert({
      where: {
        familyId_nannyId: {
          familyId: currentUser.family.id,
          nannyId: nannyId,
        },
      },
      create: {
        familyId: currentUser.family.id,
        nannyId: nannyId,
      },
      update: {},
    });

    return NextResponse.json({
      favorite,
      message: 'Babá adicionada aos favoritos',
    });
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
