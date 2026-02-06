import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { createClient } from '@/utils/supabase/server';
import { hashCpf } from '@/lib/crypto';

/**
 * POST /api/check-cpf - Check if CPF is already registered
 * Returns { available: true } if CPF is available, or { available: false, error: string } if not
 *
 * Note: This API allows users who are authenticated but don't have a profile yet (during onboarding)
 */
export async function POST(request: NextRequest) {
  try {
    // First check if user is authenticated in Supabase (even without profile)
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Try to get full user profile (may be null during onboarding)
    const currentUser = await getCurrentUser();

    const body = await request.json();
    const { cpf } = body;

    if (!cpf) {
      return NextResponse.json({ error: 'CPF é obrigatório' }, { status: 400 });
    }

    // Clean CPF (remove mask)
    const cleanCpf = cpf.replace(/\D/g, '');

    if (cleanCpf.length !== 11) {
      return NextResponse.json({ error: 'CPF inválido' }, { status: 400 });
    }

    // Create hash for lookup (CPFs are stored encrypted with hash for fast lookups)
    const cpfHashValue = hashCpf(cleanCpf);

    // Check if CPF exists in Family table (using hash for fast lookup)
    const existingFamily = await prisma.family.findFirst({
      where: {
        cpfHash: cpfHashValue,
        // Exclude current user's family from check (if they have a profile)
        ...(currentUser?.type === 'family' && { NOT: { id: currentUser.family.id } }),
      },
    });

    if (existingFamily) {
      return NextResponse.json({
        available: false,
        error: 'Este CPF já está cadastrado em outra conta',
      });
    }

    // Check if CPF exists in Nanny table (using hash for fast lookup)
    const existingNanny = await prisma.nanny.findFirst({
      where: {
        cpfHash: cpfHashValue,
        // Exclude current user's nanny from check (if they have a profile)
        ...(currentUser?.type === 'nanny' && { NOT: { id: currentUser.nanny.id } }),
      },
    });

    if (existingNanny) {
      return NextResponse.json({
        available: false,
        error: 'Este CPF já está cadastrado em outra conta',
      });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error('Error checking CPF:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
