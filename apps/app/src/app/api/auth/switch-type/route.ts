import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/auth/switch-type
 *
 * Allows a user to go back to type selection during onboarding.
 * Deletes the current Nanny or Family record (only if onboarding is NOT completed).
 * The user can then re-select their type on /app/onboarding.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const authId = user.id;

    // Check if user exists as Nanny
    const nanny = await prisma.nanny.findUnique({
      where: { authId },
    });

    if (nanny) {
      if (nanny.onboardingCompleted) {
        return NextResponse.json(
          { error: 'Onboarding já concluído. Não é possível alterar o tipo.' },
          { status: 400 },
        );
      }

      // Delete nanny record (cascade will delete subscription, etc.)
      await prisma.nanny.delete({ where: { authId } });
      return NextResponse.json({ message: 'Registro removido com sucesso' });
    }

    // Check if user exists as Family
    const family = await prisma.family.findUnique({
      where: { authId },
    });

    if (family) {
      if (family.onboardingCompleted) {
        return NextResponse.json(
          { error: 'Onboarding já concluído. Não é possível alterar o tipo.' },
          { status: 400 },
        );
      }

      // Delete family record (cascade will delete subscription, etc.)
      await prisma.family.delete({ where: { authId } });
      return NextResponse.json({ message: 'Registro removido com sucesso' });
    }

    // No record found - user is already untyped
    return NextResponse.json({ message: 'Nenhum registro encontrado' });
  } catch (error) {
    console.error('Error in /api/auth/switch-type:', error);
    return NextResponse.json(
      { error: 'Erro interno ao alterar tipo de usuário' },
      { status: 500 },
    );
  }
}
