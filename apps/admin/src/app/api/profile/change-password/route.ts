import { NextResponse } from 'next/server';
import { withAuth } from '@/proxy';
import { ChangePasswordSchema } from '@/schemas/profileSchemas';
import { getUser } from '@/lib/supabase/auth/getUser';
import { createClient } from '@/lib/supabase/server';

/**
 * PUT /api/profile/change-password
 * Altera a senha do usuário logado
 */
async function handlePut(request: Request) {
  try {
    const authUser = await getUser({ redirectOnFail: false });

    if (!authUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = ChangePasswordSchema.parse(body);

    const supabase = await createClient();

    // Atualizar senha - O Supabase requer que o usuário esteja autenticado
    // e valida a senha atual internamente quando necessário
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.newPassword,
    });

    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao atualizar senha: ' + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao alterar senha';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const PUT = withAuth(handlePut);
