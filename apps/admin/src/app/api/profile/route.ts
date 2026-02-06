import { NextResponse } from 'next/server';
import { withAuth } from '@/proxy';
import { UpdateProfileSchema } from '@/schemas/profileSchemas';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/auth/getUser';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/profile
 * Retorna o perfil do admin user logado
 */
async function handleGet() {
  try {
    const authUser = await getUser({ redirectOnFail: false });

    if (!authUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar por ID ou email
    let adminUser = await prisma.adminUser.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        status: true,
        permissions: true,
        isSuperAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Fallback para busca por email
    if (!adminUser && authUser.email) {
      adminUser = await prisma.adminUser.findUnique({
        where: { email: authUser.email },
        select: {
          id: true,
          email: true,
          name: true,
          photoUrl: true,
          status: true,
          permissions: true,
          isSuperAdmin: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    if (!adminUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(adminUser);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar perfil';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/profile
 * Atualiza o perfil do admin user logado
 */
async function handlePut(request: Request) {
  try {
    const authUser = await getUser({ redirectOnFail: false });

    if (!authUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = UpdateProfileSchema.parse(body);

    // Buscar admin user por ID ou email
    let adminUser = await prisma.adminUser.findUnique({
      where: { id: authUser.id },
      select: { id: true },
    });

    if (!adminUser && authUser.email) {
      adminUser = await prisma.adminUser.findUnique({
        where: { email: authUser.email },
        select: { id: true },
      });
    }

    if (!adminUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Atualizar no banco de dados
    const updatedUser = await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: {
        name: validatedData.name,
        photoUrl: validatedData.photoUrl,
      },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        status: true,
        permissions: true,
        isSuperAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Atualizar metadados no Supabase
    const supabase = await createClient();
    await supabase.auth.updateUser({
      data: {
        full_name: validatedData.name,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
export const PUT = withAuth(handlePut);
