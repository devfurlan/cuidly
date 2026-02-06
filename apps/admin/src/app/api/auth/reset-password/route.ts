import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/sendEmail';
import { getPasswordResetEmailTemplate } from '@/lib/email/templates';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/reset-password
 *
 * Envia email de recuperação de senha usando Resend
 * Este endpoint substitui o resetPasswordForEmail do Supabase
 * para ter controle total sobre o envio de emails
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 }
      );
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de e-mail inválido' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verificar se o usuário existe
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Erro ao verificar usuário:', listError);
      // Por segurança, não revelar se o usuário existe ou não
      return NextResponse.json({ success: true });
    }

    const user = (users as Array<{ id: string; email?: string }>)?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Por segurança, não revelar que o usuário não existe
      // Retornar sucesso mesmo assim
      console.log('Usuário não encontrado para email:', email);
      return NextResponse.json({ success: true });
    }

    // Determinar a URL base do ops (priorizar variável de ambiente)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

    // Gerar token de recuperação usando Supabase
    const { data, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: user.email!,
      options: {
        redirectTo: `${baseUrl}/reset-password`,
      },
    });

    if (resetError) {
      console.error('Erro ao gerar link de recuperação:', resetError);
      return NextResponse.json(
        { error: 'Erro ao processar solicitação de recuperação' },
        { status: 500 }
      );
    }

    // Extrair o token e construir link com formato de hash fragment (#)
    // O Supabase client processa automaticamente URLs com # (hash fragment)
    const actionLink = data.properties.action_link;
    const urlParts = new URL(actionLink);
    const token = urlParts.searchParams.get('token');
    const type = urlParts.searchParams.get('type');

    if (!token || !type) {
      console.error('Token ou type não encontrado no action_link');
      return NextResponse.json(
        { error: 'Erro ao gerar link de recuperação' },
        { status: 500 }
      );
    }

    // Construir link usando hash fragment para auto-processamento pelo Supabase
    const resetLink = `${baseUrl}/reset-password#access_token=${encodeURIComponent(token)}&type=${type}`;

    // Obter dados do usuário (nome, se disponível)
    const { data: userProfile } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single();

    // Enviar email usando Resend
    const emailTemplate = getPasswordResetEmailTemplate({
      name: userProfile?.name || email.split('@')[0],
      resetLink,
    });

    const result = await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (!result.success) {
      console.error('Erro ao enviar email:', result.error);
      return NextResponse.json(
        { error: 'Erro ao enviar e-mail de recuperação. Tente novamente mais tarde.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
