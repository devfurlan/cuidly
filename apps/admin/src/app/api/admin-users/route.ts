import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import {
  getAdminUsers,
  createAdminUser,
  checkEmailExists,
} from '@/services/adminUserService';
import { CreateAdminUserSchema } from '@/schemas/adminUserSchemas';
import { requirePermission } from '@/lib/auth/checkPermission';

/**
 * GET /api/admin-users
 * Lista todos os admin users
 */
async function handleGet() {
  try {
    // Verificar permissão
    await requirePermission('ADMIN_USERS');

    const users = await getAdminUsers();
    return NextResponse.json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar usuários';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin-users
 * Cria um novo admin user
 */
async function handlePost(request: Request) {
  try {
    // Verificar permissão
    await requirePermission('ADMIN_USERS');

    const body = await request.json();
    const validatedData = CreateAdminUserSchema.parse(body);

    // Verificar se email já existe
    const emailExists = await checkEmailExists(validatedData.email);
    if (emailExists) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este e-mail' },
        { status: 400 }
      );
    }

    const user = await createAdminUser(validatedData as Parameters<typeof createAdminUser>[0]);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar usuário';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);
