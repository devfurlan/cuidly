'use server';

import { Resend } from 'resend';

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Envia um email usando o Resend
 * Requer a variável de ambiente RESEND_API_KEY
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    // Verificar se a API key está configurada
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY não configurada. Email não será enviado.');
      console.log('Email que seria enviado:', {
        to,
        subject,
        preview: html.substring(0, 100),
      });
      return { success: false, error: 'RESEND_API_KEY não configurada' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // O email "from" precisa ser um domínio verificado no Resend
    // Para desenvolvimento, você pode usar onboarding@resend.dev
    // Para produção, configure seu domínio no Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Cuidly <onboarding@resend.dev>';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text: text || undefined,
    });

    if (error) {
      console.error('Erro ao enviar email via Resend:', error);

      // Tratamento especial para erro de validação do Resend
      if (error.name === 'validation_error' && error.message?.includes('testing emails')) {
        console.warn('⚠️  RESEND EM MODO TESTE: Só é possível enviar emails para o email do proprietário da conta.');
        console.warn('📧 Para enviar para outros destinatários:');
        console.warn('   1. Acesse https://resend.com/domains');
        console.warn('   2. Verifique seu domínio');
        console.warn('   3. Configure RESEND_FROM_EMAIL com um email do domínio verificado');
        return {
          success: false,
          error: 'Resend em modo teste. Verifique um domínio para enviar emails.'
        };
      }

      return { success: false, error: error.message };
    }

    console.log('Email enviado com sucesso via Resend:', {
      to,
      subject,
      id: data?.id,
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}
