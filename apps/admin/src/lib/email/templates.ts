/**
 * Template de email de recuperação de senha
 */
export function getPasswordResetEmailTemplate(data: {
  name: string;
  resetLink: string;
}) {
  return {
    subject: 'Recuperação de senha - Cuidly Admin',
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperação de Senha</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7eef9; line-height: 1.6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7eef9; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(158, 80, 169, 0.15);">

                  <!-- Header com gradiente fuchsia -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #9e50a9 0%, #ba6fc6 100%); padding: 48px 32px; text-align: center;">
                      <img src="https://admin.cuidly.com/assets/img/logo-h.png" alt="Cuidly" style="max-width: 140px; height: auto; margin-bottom: 24px;" />
                      <h1 style="margin: 0 0 16px 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                        Recuperação de Senha 🔑
                      </h1>
                      <p style="margin: 0; color: #eedbf3; font-size: 18px; font-weight: 400;">
                        Recebemos uma solicitação para redefinir sua senha
                      </p>
                    </td>
                  </tr>

                  <!-- Conteúdo Principal -->
                  <tr>
                    <td style="padding: 40px 32px;">
                      <p style="margin: 0 0 24px 0; color: #1f2937; font-size: 18px; font-weight: 500;">
                        Olá, ${data.name}! 👋
                      </p>

                      <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.7;">
                        Recebemos uma solicitação para redefinir a senha da sua conta na Cuidly Admin. Se foi você quem solicitou, clique no botão abaixo para criar uma nova senha.
                      </p>

                      <!-- CTA Button - Redefinir Senha -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${data.resetLink}" style="display: inline-block; background: #9e50a9; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(158, 80, 169, 0.3);">
                              Redefinir minha senha
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Aviso de Segurança -->
                      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">
                          ⚠️ Importante
                        </p>
                        <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                          Este link expira em <strong>1 hora</strong> por questões de segurança. Se você não solicitou a recuperação de senha, ignore este e-mail. Sua senha permanecerá a mesma.
                        </p>
                      </div>

                      <!-- Link Alternativo -->
                      <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Se o botão não funcionar, copie e cole este link no seu navegador:
                      </p>
                      <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px; word-break: break-all;">
                        ${data.resetLink}
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7eef9; padding: 24px 32px; text-align: center; border-top: 1px solid #eedbf3;">
                      <p style="margin: 0 0 8px 0; color: #9e50a9; font-size: 14px; font-weight: 600;">
                        Cuidly
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
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
Recuperação de Senha 🔑

Olá, ${data.name}!

Recebemos uma solicitação para redefinir a senha da sua conta na Cuidly Admin. Se foi você quem solicitou, clique no link abaixo para criar uma nova senha.

Redefinir senha:
${data.resetLink}

⚠️ IMPORTANTE
Este link expira em 1 hora por questões de segurança. Se você não solicitou a recuperação de senha, ignore este e-mail. Sua senha permanecerá a mesma.

---
Cuidly
© ${new Date().getFullYear()} Cuidly. Todos os direitos reservados.
    `.trim(),
  };
}

/**
 * Template de email de boas-vindas para novos usuários admin
 */
export function getWelcomeAdminEmailTemplate(data: {
  name: string;
  email: string;
  password: string;
  loginUrl: string;
}) {
  return {
    subject: 'Boas-vindas à Cuidly Admin! 🎉',
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Boas-vindas à Cuidly Admin!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7eef9; line-height: 1.6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7eef9; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(158, 80, 169, 0.15);">

                  <!-- Header com gradiente fuchsia -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #9e50a9 0%, #ba6fc6 100%); padding: 48px 32px; text-align: center;">
                      <img src="https://admin.cuidly.com/assets/img/logo-h.png" alt="Cuidly" style="max-width: 140px; height: auto; margin-bottom: 24px;" />
                      <h1 style="margin: 0 0 16px 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                        Boas-vindas à Cuidly Admin! 🎉
                      </h1>
                      <p style="margin: 0; color: #eedbf3; font-size: 18px; font-weight: 400;">
                        Sua conta de administrador foi criada com sucesso
                      </p>
                    </td>
                  </tr>

                  <!-- Conteúdo Principal -->
                  <tr>
                    <td style="padding: 40px 32px;">
                      <p style="margin: 0 0 24px 0; color: #1f2937; font-size: 18px; font-weight: 500;">
                        Olá, ${data.name}! 👋
                      </p>

                      <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.7;">
                        Estamos felizes em ter você na equipe! Abaixo estão suas credenciais de acesso à plataforma Cuidly Admin.
                      </p>

                      <!-- Caixa de Credenciais -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7eef9; border: 2px solid #eedbf3; border-radius: 12px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">
                              📧 E-mail
                            </p>
                            <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; font-family: 'SF Mono', Monaco, 'Courier New', monospace; background-color: #ffffff; padding: 12px 16px; border-radius: 8px;">
                              ${data.email}
                            </p>

                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">
                              🔐 Senha temporária
                            </p>
                            <p style="margin: 0; color: #1f2937; font-size: 16px; font-family: 'SF Mono', Monaco, 'Courier New', monospace; background-color: #ffffff; padding: 12px 16px; border-radius: 8px; border: 2px dashed #eedbf3;">
                              ${data.password}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Aviso de Segurança -->
                      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">
                          ⚠️ Importante
                        </p>
                        <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                          Por questões de segurança, recomendamos que você <strong>altere sua senha no primeiro acesso</strong>.
                        </p>
                      </div>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${data.loginUrl}" style="display: inline-block; background: #9e50a9; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(158, 80, 169, 0.3);">
                              Acessar Cuidly Admin
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7eef9; padding: 24px 32px; text-align: center; border-top: 1px solid #eedbf3;">
                      <p style="margin: 0 0 8px 0; color: #9e50a9; font-size: 14px; font-weight: 600;">
                        Cuidly
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
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
Boas-vindas à Cuidly Admin! 🎉

Olá, ${data.name}! 👋

Estamos felizes em ter você na equipe! Abaixo estão suas credenciais de acesso à plataforma Cuidly Admin.

📧 E-mail: ${data.email}
🔐 Senha temporária: ${data.password}

⚠️ IMPORTANTE
Por questões de segurança, recomendamos que você altere sua senha no primeiro acesso.

Acesse o sistema em: ${data.loginUrl}

---
Cuidly
© ${new Date().getFullYear()} Cuidly. Todos os direitos reservados.
    `.trim(),
  };
}

/**
 * Template de email de boas-vindas para novas babás
 */
export function getWelcomeNannyEmailTemplate(data: {
  name: string;
  email: string;
  password: string;
  loginUrl: string;
}) {
  return {
    subject: 'Boas-vindas à Cuidly! 🌟',
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Boas-vindas à Cuidly!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7eef9; line-height: 1.6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7eef9; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(158, 80, 169, 0.15);">

                  <!-- Header com gradiente fuchsia -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #9e50a9 0%, #ba6fc6 100%); padding: 48px 32px; text-align: center;">
                      <img src="https://admin.cuidly.com/assets/img/logo-h.png" alt="Cuidly" style="max-width: 140px; height: auto; margin-bottom: 24px;" />
                      <h1 style="margin: 0 0 16px 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                        Boas-vindas à Cuidly! 🌟
                      </h1>
                      <p style="margin: 0; color: #eedbf3; font-size: 18px; font-weight: 400;">
                        Sua conta foi criada com sucesso
                      </p>
                    </td>
                  </tr>

                  <!-- Conteúdo Principal -->
                  <tr>
                    <td style="padding: 40px 32px;">
                      <p style="margin: 0 0 24px 0; color: #1f2937; font-size: 18px; font-weight: 500;">
                        Olá, ${data.name}! 👋
                      </p>

                      <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.7;">
                        Ficamos muito felizes em ter você conosco! Uma conta foi criada para você na plataforma Cuidly. Abaixo estão suas credenciais de acesso:
                      </p>

                      <!-- Caixa de Credenciais -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7eef9; border: 2px solid #eedbf3; border-radius: 12px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">
                              📧 E-mail
                            </p>
                            <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; font-family: 'SF Mono', Monaco, 'Courier New', monospace; background-color: #ffffff; padding: 12px 16px; border-radius: 8px;">
                              ${data.email}
                            </p>

                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">
                              🔐 Senha provisória
                            </p>
                            <p style="margin: 0; color: #1f2937; font-size: 16px; font-family: 'SF Mono', Monaco, 'Courier New', monospace; background-color: #ffffff; padding: 12px 16px; border-radius: 8px; border: 2px dashed #eedbf3;">
                              ${data.password}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Aviso de Segurança -->
                      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">
                          ⚠️ Importante
                        </p>
                        <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                          Por questões de segurança, recomendamos que você <strong>altere sua senha no primeiro acesso</strong>.
                        </p>
                      </div>

                      <!-- Próximos Passos -->
                      <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <p style="margin: 0 0 12px 0; color: #166534; font-size: 14px; font-weight: 600;">
                          📋 Próximos passos
                        </p>
                        <p style="margin: 0; color: #15803d; font-size: 14px; line-height: 1.8;">
                          1. Acesse a plataforma e faça login<br/>
                          2. Complete seu perfil com suas experiências<br/>
                          3. Adicione sua disponibilidade semanal<br/>
                          4. Comece a receber oportunidades de trabalho!
                        </p>
                      </div>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${data.loginUrl}" style="display: inline-block; background: #9e50a9; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(158, 80, 169, 0.3);">
                              Acessar Plataforma
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                        Se tiver alguma dúvida, entre em contato conosco.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7eef9; padding: 24px 32px; text-align: center; border-top: 1px solid #eedbf3;">
                      <p style="margin: 0 0 8px 0; color: #9e50a9; font-size: 14px; font-weight: 600;">
                        Cuidly
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
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
Boas-vindas à Cuidly! 🌟

Olá, ${data.name}! 👋

Ficamos muito felizes em ter você conosco! Uma conta foi criada para você na plataforma Cuidly.

📧 E-mail: ${data.email}
🔐 Senha provisória: ${data.password}

⚠️ IMPORTANTE
Por questões de segurança, recomendamos que você altere sua senha no primeiro acesso.

📋 PRÓXIMOS PASSOS
1. Acesse a plataforma e faça login
2. Complete seu perfil com suas experiências
3. Adicione sua disponibilidade semanal
4. Comece a receber oportunidades de trabalho!

Acesse o sistema em: ${data.loginUrl}

Se tiver alguma dúvida, entre em contato conosco.

---
Cuidly
© ${new Date().getFullYear()} Cuidly. Todos os direitos reservados.
    `.trim(),
  };
}
