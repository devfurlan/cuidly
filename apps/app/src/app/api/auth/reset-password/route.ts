import { sendEmail } from '@/lib/email/sendEmail';
import { getPasswordResetEmailTemplate } from '@/lib/email/react-templates';
import { createAdminClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { passwordResetLimiter, getClientIP } from '@/lib/rate-limiter';

/**
 * POST /api/auth/reset-password
 *
 * Envia email de recuperação de senha usando Resend
 * Este endpoint substitui o resetPasswordForEmail do Supabase
 * para ter controle total sobre o envio de emails
 *
 * SEGURANÇA:
 * - Rate limiting por IP
 * - Não revela se usuário existe
 * - Logs sem dados sensíveis
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP para prevenir brute force
    const clientIP = getClientIP(request.headers);
    const rateLimitResult = await passwordResetLimiter.check(`reset:${clientIP}`);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Muitas tentativas. Tente novamente mais tarde.',
          retryAfter: Math.ceil(rateLimitResult.resetIn / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)),
          },
        },
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 },
      );
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de e-mail inválido' },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Verificar se o usuário existe
    const {
      data: { users },
      error: listError,
    } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('[AUTH] Erro ao verificar usuário para reset de senha');
      // Por segurança, não revelar se o usuário existe ou não
      return NextResponse.json({ success: true });
    }

    const user = users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );

    if (!user) {
      // Por segurança, não revelar que o usuário não existe
      // Retornar sucesso mesmo assim para prevenir enumeração
      console.log('[AUTH] Reset de senha solicitado para email não cadastrado');
      return NextResponse.json({ success: true });
    }

    // Determinar a URL base do app (priorizar variável de ambiente)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

    // Gerar token de recuperação usando Supabase
    const { data, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: user.email!,
      options: {
        redirectTo: `${baseUrl}/redefinir-senha`,
      },
    });

    if (resetError) {
      console.error('[AUTH] Erro ao gerar link de recuperação');
      return NextResponse.json(
        { error: 'Erro ao processar solicitação de recuperação' },
        { status: 500 },
      );
    }

    // Extrair o token do action_link gerado pelo Supabase
    const actionLink = data.properties.action_link;
    const urlParts = new URL(actionLink);
    const token = urlParts.searchParams.get('token');
    const type = urlParts.searchParams.get('type');

    if (!token || !type) {
      console.error('[AUTH] Token não encontrado no action_link');
      return NextResponse.json(
        { error: 'Erro ao gerar link de recuperação' },
        { status: 500 },
      );
    }

    // Construir link usando query parameter com código de troca
    // O token não é exposto diretamente na URL para evitar vazamento via Referer
    // Em vez disso, usamos um código de troca de curta duração armazenado no servidor
    const exchangeResponse = await fetch(`${baseUrl}/api/auth/exchange-reset-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, type }),
    });

    if (!exchangeResponse.ok) {
      console.error('[AUTH] Erro ao criar código de troca');
      return NextResponse.json(
        { error: 'Erro ao gerar link de recuperação' },
        { status: 500 },
      );
    }

    const { code } = await exchangeResponse.json();
    const resetLink = `${baseUrl}/redefinir-senha?code=${code}`;

    // Obter dados do usuário (nome, se disponível)
    const { data: profile } = await supabase
      .from('partners')
      .select('name')
      .eq('id', user.id)
      .single();

    // Enviar email usando Resend
    const firstName = (profile?.name || email.split('@')[0]).split(' ')[0];
    const emailTemplate = await getPasswordResetEmailTemplate({
      name: firstName,
      resetLink,
    });

    const result = await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (!result.success) {
      console.error('[AUTH] Erro ao enviar email de recuperação');
      return NextResponse.json(
        {
          error:
            'Erro ao enviar e-mail de recuperação. Tente novamente mais tarde.',
        },
        { status: 500 },
      );
    }

    console.log('[AUTH] Email de recuperação enviado com sucesso');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AUTH] Erro na recuperação de senha:', error instanceof Error ? error.message : 'Erro desconhecido');
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 },
    );
  }
}
