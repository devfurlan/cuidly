import { NextResponse } from 'next/server';
import {
  getAdminUserById,
  updateAdminUser,
  deleteAdminUser,
  checkEmailExists,
  checkSuperAdminProtection,
} from '@/services/adminUserService';
import { UpdateAdminUserSchema } from '@/schemas/adminUserSchemas';
import { requirePermission } from '@/lib/auth/checkPermission';
import { createClient } from '@/lib/supabase/server';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/admin-users/:id
 * Busca um admin user específico
 */
export async function GET(_request: Request, context: RouteParams) {
  try {
    // Verificar autenticação
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar permissão
    await requirePermission('ADMIN_USERS');

    const { id } = await context.params;
    const adminUser = await getAdminUserById(id);

    if (!adminUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(adminUser);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar usuário';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/admin-users/:id
 * Atualiza um admin user
 */
export async function PUT(request: Request, context: RouteParams) {
  try {
    // Verificar autenticação
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar permissão
    await requirePermission('ADMIN_USERS');

    const { id } = await context.params;

    // Verificar se é superadmin
    const isSuperAdmin = await checkSuperAdminProtection(id);

    const body = await request.json();
    const validatedData = UpdateAdminUserSchema.parse(body);

    // Verificar se email já existe (excluindo o próprio usuário)
    if (validatedData.email) {
      const emailExists = await checkEmailExists(validatedData.email, id);
      if (emailExists) {
        return NextResponse.json(
          { error: 'Já existe um usuário com este e-mail' },
          { status: 400 }
        );
      }
    }

    // Impedir modificação de superadmin
    if (isSuperAdmin && validatedData.isSuperAdmin === false) {
      return NextResponse.json(
        { error: 'Não é possível remover privilégios de superadmin' },
        { status: 403 }
      );
    }

    const adminUser = await updateAdminUser(id, validatedData as Parameters<typeof updateAdminUser>[1]);
    return NextResponse.json(adminUser);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin-users/:id
 * Deleta (soft delete) um admin user
 */
export async function DELETE(_request: Request, context: RouteParams) {
  try {
    // Verificar autenticação
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar permissão
    await requirePermission('ADMIN_USERS');

    const { id } = await context.params;

    // Verificar se é superadmin
    const isSuperAdmin = await checkSuperAdminProtection(id);
    if (isSuperAdmin) {
      return NextResponse.json(
        { error: 'Não é possível deletar um superadmin' },
        { status: 403 }
      );
    }

    await deleteAdminUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao deletar usuário';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
