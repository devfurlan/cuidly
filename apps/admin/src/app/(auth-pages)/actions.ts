'use server';

import { encodedRedirect } from '@/utils/utils';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Traduzir mensagens de erro do Supabase para português
const translateSupabaseError = (errorMessage: string): string => {
  const translations: Record<string, string> = {
    'Invalid login credentials': 'E-mail ou senha incorretos',
    'Email not confirmed': 'E-mail não confirmado',
    'User already registered': 'Este e-mail já está cadastrado',
    'Password should be at least 6 characters':
      'A senha deve ter pelo menos 6 caracteres',
    'Unable to validate email address: invalid format':
      'Formato de e-mail inválido',
    'Email rate limit exceeded':
      'Limite de envio de e-mails excedido. Tente novamente mais tarde',
    'Password is known to be weak and easy to guess, please choose a different one.':
      'Esta senha é conhecida por ser fraca e fácil de adivinhar, por favor escolha outra diferente.',
  };

  return translations[errorMessage] || errorMessage;
};

export const signUpAction = async (formData: FormData) => {
  const supabase = await createClient();
  const origin = (await headers()).get('origin');

  const credentials = {
    full_name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: credentials.full_name,
      },
    },
  });

  if (error) {
    console.error(error.code + ' ' + error.message);
    return encodedRedirect('error', '/register', translateSupabaseError(error.message));
  }

  return encodedRedirect(
    'success',
    '/register',
    'Obrigado por se cadastrar! Enviamos um e-mail com um link de verificação. Verifique sua caixa de entrada para ativar sua conta.',
  );
};

export const signInAction = async (formData: FormData) => {
  const supabase = await createClient();

  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    return encodedRedirect('error', '/login', translateSupabaseError(error.message));
  }

  // Verificar se é um admin user
  const adminUser = await prisma.adminUser.findUnique({
    where: {
      email: credentials.email,
    },
    select: { id: true, email: true, status: true },
  });

  if (!adminUser) {
    // Não permitir criação automática de usuários no ops
    // Apenas administradores previamente cadastrados podem acessar
    await supabase.auth.signOut();
    return encodedRedirect(
      'error',
      '/login',
      'Acesso negado. Este usuário não tem permissão para acessar o sistema.'
    );
  }

  // Verificar status do usuário
  if (adminUser.status !== 'ACTIVE') {
    await supabase.auth.signOut();

    const statusMessages = {
      INACTIVE:
        'Sua conta está inativa. Entre em contato com o administrador.',
      SUSPENDED:
        'Sua conta foi suspensa. Entre em contato com o administrador.',
      DELETED:
        'Sua conta foi removida. Entre em contato com o administrador.',
      PENDING: 'Sua conta está pendente de aprovação.',
    };

    const message =
      statusMessages[adminUser.status as keyof typeof statusMessages] ||
      'Acesso não autorizado. Entre em contato com o administrador.';

    return encodedRedirect('error', '/login', message);
  }

  revalidatePath('/', 'layout');
  return redirect('/');
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString();
  const origin = (await headers()).get('origin');
  const callbackUrl = formData.get('callbackUrl')?.toString();

  if (!email) {
    return encodedRedirect('error', '/forgot-password', 'E-mail é obrigatório');
  }

  try {
    // Usar API customizada que envia email via Resend
    const response = await fetch(`${origin}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Não foi possível enviar o e-mail de recuperação');
    }

    if (callbackUrl) {
      return redirect(callbackUrl);
    }

    return encodedRedirect(
      'success',
      '/forgot-password',
      'Verifique seu e-mail para o link de recuperação de senha.',
    );
  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error);
    return encodedRedirect(
      'error',
      '/forgot-password',
      'Não foi possível enviar o e-mail de recuperação',
    );
  }
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      'error',
      '/reset-password',
      'Senha e confirmação de senha são obrigatórias',
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect('error', '/reset-password', 'As senhas não coincidem');
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    console.error(error);
    encodedRedirect('error', '/reset-password', 'Falha ao atualizar a senha');
  }

  encodedRedirect('success', '/reset-password', 'Senha atualizada com sucesso');
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/login');
};

export const signInWithGoogle = async () => {
  const supabase = await createClient();
  const origin = (await headers()).get('origin');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error);
    return encodedRedirect('error', '/login', 'Falha ao entrar com Google');
  }

  return redirect(data.url);
};

export const signInWithFacebook = async () => {
  const supabase = await createClient();
  const origin = (await headers()).get('origin');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error);
    return encodedRedirect('error', '/login', 'Falha ao entrar com Facebook');
  }

  return redirect(data.url);
};
