'use server';

import prisma from '@/lib/prisma';
import { AdminPermission, CommonStatus } from '@prisma/client';
import { logAudit } from '@/utils/auditLog';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/sendEmail';
import { getWelcomeAdminEmailTemplate } from '@/lib/email/templates';

export type AdminUserData = {
  name: string;
  email: string;
  photoUrl?: string;
  permissions: AdminPermission[];
  isSuperAdmin?: boolean;
  status?: CommonStatus;
  notifyFailedPayments?: boolean;
};

export type AdminUserUpdateData = Partial<AdminUserData>;

export type AdminUserWithPassword = AdminUserData & {
  password: string;
};

/**
 * Lista todos os usuários admins (exceto dados sensíveis)
 */
export async function getAdminUsers() {
  const users = await prisma.adminUser.findMany({
    where: {
      status: { not: 'DELETED' },
    },
    select: {
      id: true,
      name: true,
      email: true,
      photoUrl: true,
      permissions: true,
      isSuperAdmin: true,
      status: true,
      notifyFailedPayments: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Buscar informações de login do Supabase Auth para cada usuário
  const usersWithLastVisit = await Promise.all(
    users.map(async (user) => {
      let lastVisitAt: Date | null = null;

      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
        if (authUser?.user?.last_sign_in_at) {
          lastVisitAt = new Date(authUser.user.last_sign_in_at);
        }
      } catch (error) {
        console.error(`Erro ao buscar last_sign_in_at para usuário ${user.id}:`, error);
      }

      return {
        ...user,
        lastVisitAt,
      };
    })
  );

  return usersWithLastVisit;
}

/**
 * Busca um admin user específico por ID
 */
export async function getAdminUserById(id: string) {
  const user = await prisma.adminUser.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      photoUrl: true,
      permissions: true,
      isSuperAdmin: true,
      status: true,
      notifyFailedPayments: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user || user.status === 'DELETED') return null;

  return user;
}

/**
 * Busca um admin user por email
 */
export async function getAdminUserByEmail(email: string) {
  const user = await prisma.adminUser.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      photoUrl: true,
      permissions: true,
      isSuperAdmin: true,
      status: true,
      notifyFailedPayments: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user || user.status === 'DELETED') return null;

  return user;
}

/**
 * Verifica se um usuário é superadmin (proteção contra edição/exclusão)
 */
export async function checkSuperAdminProtection(id: string): Promise<boolean> {
  const user = await prisma.adminUser.findUnique({
    where: { id },
    select: { isSuperAdmin: true },
  });

  return user?.isSuperAdmin ?? false;
}

/**
 * Cria um novo admin user
 */
export async function createAdminUser(data: AdminUserWithPassword) {
  // Verificar se email já existe ativo
  const activeUser = await prisma.adminUser.findFirst({
    where: {
      email: data.email,
      status: { not: 'DELETED' },
    },
  });

  if (activeUser) {
    throw new Error('Já existe um usuário com este e-mail');
  }

  // Verificar se existe um usuário deletado com este email
  const deletedUser = await prisma.adminUser.findFirst({
    where: {
      email: data.email,
      status: 'DELETED',
    },
  });

  // Se existe usuário deletado, deletar completamente antes de criar novo
  if (deletedUser) {
    // Deletar também do Supabase Auth se existir
    try {
      await supabaseAdmin.auth.admin.deleteUser(deletedUser.id);
    } catch {
      console.log(`Usuário ${deletedUser.id} não existe no Supabase Auth, apenas no BD`);
    }

    await prisma.adminUser.delete({
      where: { id: deletedUser.id },
    });
    console.log(`Usuário deletado ${deletedUser.id} removido do BD para recriar`);
  }

  // Gerar UUID para o usuário
  const userId = crypto.randomUUID();

  // Primeira estratégia: Criar no BD primeiro, depois no Auth
  // Isso evita que triggers do Supabase tentem criar o registro automaticamente
  console.log('Criando registro no banco de dados primeiro...');

  let user;
  try {
    user = await prisma.adminUser.create({
      data: {
        id: userId,
        email: data.email,
        name: data.name,
        photoUrl: data.photoUrl,
        permissions: data.permissions,
        isSuperAdmin: data.isSuperAdmin ?? false,
        status: data.status ?? 'ACTIVE',
        notifyFailedPayments: data.notifyFailedPayments ?? true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        permissions: true,
        isSuperAdmin: true,
        status: true,
        notifyFailedPayments: true,
        createdAt: true,
      },
    });
    console.log('Registro criado no banco de dados com ID:', userId);
  } catch (dbError) {
    console.error('Erro ao criar registro no banco de dados:', dbError);
    throw new Error('Erro ao criar registro no banco de dados');
  }

  // Agora criar o usuário no Supabase Auth com o mesmo ID
  console.log('Criando usuário no Supabase Auth com ID pré-definido:', userId);

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      id: userId, // Usar o mesmo UUID que criamos no BD
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.name,
        role: 'ADMIN',
      },
    });

    if (authError) {
      console.error('Erro ao criar usuário no Supabase Auth:', authError);

      // Se falhar, deletar o registro do banco de dados para manter consistência
      console.log('Revertendo criação do usuário no banco de dados...');
      await prisma.adminUser.delete({ where: { id: userId } });

      throw new Error(authError.message || 'Erro ao criar usuário no Supabase Auth');
    }

    console.log('Usuário criado com sucesso no Supabase Auth:', authData.user.id);
  } catch (error) {
    console.error('Erro ao criar usuário no Auth:', error);
    throw new Error(error instanceof Error ? error.message : 'Erro ao criar usuário no Supabase Auth');
  }

  // Log de auditoria
  await logAudit({
    action: 'CREATE',
    table: 'admin_users',
    recordId: user.id,
    data: {
      email: data.email,
      name: data.name,
      permissions: data.permissions,
      isSuperAdmin: data.isSuperAdmin,
    },
  });

  // Enviar email de boas-vindas com credenciais
  try {
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`;
    const emailTemplate = getWelcomeAdminEmailTemplate({
      name: data.name,
      email: data.email,
      password: data.password,
      loginUrl,
    });

    await sendEmail({
      to: data.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    console.log(`Email de boas-vindas enviado para ${data.email}`);
  } catch (emailError) {
    // Não falhar a criação do usuário se o email falhar
    console.error('Erro ao enviar email de boas-vindas:', emailError);
  }

  return user;
}

/**
 * Atualiza um admin user
 */
export async function updateAdminUser(id: string, data: AdminUserUpdateData) {
  // Verificar se é superadmin
  const isSuperAdmin = await checkSuperAdminProtection(id);
  if (isSuperAdmin && data.isSuperAdmin === false) {
    throw new Error('Não é possível remover privilégios de superadmin');
  }

  const user = await prisma.adminUser.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      photoUrl: data.photoUrl,
      permissions: data.permissions,
      status: data.status,
      notifyFailedPayments: data.notifyFailedPayments,
      // Apenas permite alterar isSuperAdmin se não estava definido antes
      ...(data.isSuperAdmin !== undefined && !isSuperAdmin && {
        isSuperAdmin: data.isSuperAdmin,
      }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      permissions: true,
      isSuperAdmin: true,
      status: true,
      notifyFailedPayments: true,
      updatedAt: true,
    },
  });

  // Atualizar Supabase Auth user_metadata para manter sincronizado
  try {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      id,
      {
        email: data.email,
        user_metadata: {
          full_name: data.name,
          role: 'ADMIN',
        },
      }
    );

    if (authError) {
      console.error('Erro ao atualizar user_metadata no Supabase Auth:', authError);
      // Não falha a operação, apenas loga o erro
    } else {
      console.log(`user_metadata atualizado no Supabase Auth para ${data.email}`);
    }
  } catch (error) {
    console.error('Erro ao sincronizar com Supabase Auth:', error);
    // Não falha a operação, apenas loga o erro
  }

  // Log de auditoria
  await logAudit({
    action: 'UPDATE',
    table: 'admin_users',
    recordId: id,
    data: {
      name: data.name,
      email: data.email,
      permissions: data.permissions,
      status: data.status,
    },
  });

  return user;
}

/**
 * Deleta um admin user (soft delete no DB + delete no Supabase Auth)
 */
export async function deleteAdminUser(id: string) {
  // Verificar se é superadmin
  const isSuperAdmin = await checkSuperAdminProtection(id);
  if (isSuperAdmin) {
    throw new Error('Não é possível deletar um superadmin');
  }

  // Deletar do Supabase Auth
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

  // Ignorar erro se usuário já não existe no Supabase Auth
  if (authError && authError.code !== 'user_not_found') {
    console.error('Erro ao deletar usuário do Supabase Auth:', authError);
    throw new Error(`Erro ao deletar usuário: ${authError.message}`);
  }

  // Se o usuário já estava deletado do Auth, apenas logar
  if (authError?.code === 'user_not_found') {
    console.warn(`Usuário ${id} já estava deletado do Supabase Auth, apenas atualizando BD`);
  }

  // Soft delete no banco de dados
  await prisma.adminUser.update({
    where: { id },
    data: {
      status: 'DELETED',
      deletedAt: new Date(),
    },
  });

  // Log de auditoria
  await logAudit({
    action: 'DELETE',
    table: 'admin_users',
    recordId: id,
    data: { status: 'DELETED' },
  });

  return { success: true };
}

/**
 * Verifica se email já está em uso
 */
export async function checkEmailExists(email: string, excludeId?: string) {
  const user = await prisma.adminUser.findFirst({
    where: {
      email,
      status: { not: 'DELETED' },
      ...(excludeId && { id: { not: excludeId } }),
    },
  });

  return !!user;
}
