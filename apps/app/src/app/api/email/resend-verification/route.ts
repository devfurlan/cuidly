/**
 * API Route: Resend Email Verification Code
 * POST /api/email/resend-verification
 *
 * Reenvia código de verificação de email
 */

import { getCurrentUser, getCurrentUserEmail } from '@/lib/auth/getCurrentUser';
import { sendEmail } from '@/lib/email/sendEmail';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { config } from '@/config';

export async function POST() {
  try {
    // Get authenticated user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Get entity data based on user type
    const entity =
      currentUser.type === 'nanny' ? currentUser.nanny : currentUser.family;

    // Check if email already verified
    if (entity.emailVerified) {
      return NextResponse.json(
        {
          error: 'E-mail já verificado',
          message: 'Seu e-mail já foi verificado',
        },
        { status: 400 },
      );
    }

    // Check rate limit (only allow resend after 2 minutes)
    if (entity.emailVerificationSent) {
      const timeSinceLastSend =
        Date.now() - entity.emailVerificationSent.getTime();
      const twoMinutes = 2 * 60 * 1000;

      if (timeSinceLastSend < twoMinutes) {
        const remainingSeconds = Math.ceil(
          (twoMinutes - timeSinceLastSend) / 1000,
        );
        return NextResponse.json(
          {
            error: 'Aguarde antes de reenviar',
            message: `Aguarde ${remainingSeconds} segundos antes de solicitar um novo código`,
          },
          { status: 429 },
        );
      }
    }

    // Generate new verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // Generate new token for magic link
    const crypto = await import('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Update entity with new code and token based on user type
    if (currentUser.type === 'nanny') {
      await prisma.nanny.update({
        where: { id: entity.id },
        data: {
          emailVerificationCode: verificationCode,
          emailVerificationToken: verificationToken,
          emailVerificationSent: new Date(),
        },
      });
    } else {
      await prisma.family.update({
        where: { id: entity.id },
        data: {
          emailVerificationCode: verificationCode,
          emailVerificationToken: verificationToken,
          emailVerificationSent: new Date(),
        },
      });
    }

    // Build verification URL
    const verifyEmailUrl = `${config.site.url}/verificar-email?token=${verificationToken}`;

    // Send email with code and link
    // Cores do design system Cuidly:
    // Fuchsia-500: #ba6fc6, Fuchsia-600: #9e50a9, Fuchsia-700: #84408b
    // Blue-500: #8093d4, Blue-600: #5c6bc0
    const emailTemplate = {
      subject: 'Código de verificação de e-mail - Cuidly',
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Código de Verificação</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7eef9;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7eef9; padding: 20px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(158, 80, 169, 0.15);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #9e50a9 0%, #ba6fc6 100%); padding: 40px 32px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                          Código de Verificação
                        </h1>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 32px; text-align: center;">
                        <p style="margin: 0 0 20px 0; color: #565255; font-size: 16px; line-height: 1.7;">
                          Clique no botão abaixo para verificar seu e-mail instantaneamente:
                        </p>

                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
                          <tr>
                            <td align="center">
                              <a href="${verifyEmailUrl}" style="display: inline-block; background: linear-gradient(135deg, #5c6bc0 0%, #8093d4 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(92, 107, 192, 0.3);">
                                ✓ Verificar meu e-mail
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 20px 0 12px 0; color: #7f767e; font-size: 13px;">
                          Ou digite este código no dashboard:
                        </p>

                        <div style="background: #f7eef9; border: 2px dashed #ba6fc6; border-radius: 12px; padding: 20px; margin: 16px auto; max-width: 240px;">
                          <p style="margin: 0; color: #84408b; font-size: 36px; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 6px;">
                            ${verificationCode}
                          </p>
                        </div>

                        <p style="margin: 20px 0 0 0; color: #7f767e; font-size: 14px;">
                          Este link e código expiram em 24 horas
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f7eef9; padding: 24px 32px; text-align: center; border-top: 1px solid #eedbf3;">
                        <p style="margin: 0; color: #9d949d; font-size: 12px;">
                          © ${new Date().getFullYear()} Cuidly. Todos os direitos reservados.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `
Código de Verificação de e-mail

Use o código abaixo para verificar seu e-mail:

${verificationCode}

Este código expira em 24 horas.

---
© ${new Date().getFullYear()} Cuidly. Todos os direitos reservados.
      `.trim(),
    };

    const userEmail = getCurrentUserEmail(currentUser);
    console.log('[Email Verification] User email:', userEmail);
    console.log('[Email Verification] User type:', currentUser.type);

    if (!userEmail) {
      console.error('[Email Verification] Email not found for user');
      return NextResponse.json(
        {
          error: 'E-mail não encontrado',
          message: 'Não foi possível enviar o e-mail de verificação',
        },
        { status: 400 },
      );
    }

    console.log('[Email Verification] Sending email to:', userEmail);
    const result = await sendEmail({
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (!result.success) {
      console.error(
        '[Email Verification] Error sending verification email:',
        result.error,
      );
      // Show more specific error message to help debug
      let userMessage =
        'Não foi possível enviar o e-mail de verificação. Tente novamente em alguns minutos.';
      if (result.error?.includes('RESEND_API_KEY')) {
        userMessage = 'Serviço de e-mail não configurado. Contate o suporte.';
      } else if (
        result.error?.includes('testing emails') ||
        result.error?.includes('modo teste') ||
        result.error?.includes('can only send')
      ) {
        userMessage =
          'Serviço de e-mail em modo de teste. Verifique o domínio no Resend.';
      } else if (
        result.error?.includes('domain') ||
        result.error?.includes('not verified')
      ) {
        userMessage = 'Domínio de e-mail não verificado. Contate o suporte.';
      }
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: userMessage,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Código de verificação enviado com sucesso',
    });
  } catch (error) {
    console.error('Resend verification error:', error);

    return NextResponse.json(
      {
        error: 'Erro no servidor',
        message: 'Ocorreu um erro ao enviar o código de verificação',
      },
      { status: 500 },
    );
  }
}
