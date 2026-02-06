# Templates de E-mail do Supabase

Estes templates devem ser configurados no painel do Supabase em **Authentication > Email Templates**.

## Templates de Autenticação

| Template | Arquivo | Subject sugerido |
|----------|---------|------------------|
| Confirm sign up | `confirm-signup.html` | Confirme seu e-mail - Cuidly |
| Invite user | `invite-user.html` | Você foi convidado para a Cuidly |
| Magic link | `magic-link.html` | Seu link de acesso - Cuidly |
| Change email address | `change-email.html` | Confirme seu novo e-mail - Cuidly |
| Reset password | `reset-password.html` | Recuperação de senha - Cuidly |
| Reauthentication | `reauthentication.html` | Confirmação de segurança - Cuidly |

## Templates de Segurança

| Template | Arquivo | Subject sugerido |
|----------|---------|------------------|
| Password changed | `password-changed.html` | Sua senha foi alterada - Cuidly |
| Email address changed | `email-changed.html` | Seu e-mail foi alterado - Cuidly |

## Variáveis disponíveis no Supabase

- `{{ .ConfirmationURL }}` - URL de confirmação (usada em todos os templates de ação)
- `{{ .Token }}` - Token de confirmação
- `{{ .TokenHash }}` - Hash do token
- `{{ .SiteURL }}` - URL do site configurado
- `{{ .RedirectTo }}` - URL de redirecionamento

## Como configurar

1. Acesse o painel do Supabase
2. Vá em **Authentication > Email Templates**
3. Para cada template:
   - Cole o conteúdo HTML do arquivo correspondente
   - Configure o Subject conforme a tabela acima
   - Salve as alterações

## Observações

- Os templates usam o mesmo layout visual dos e-mails enviados via Resend
- As imagens (logo e ícones de redes sociais) são carregadas de `https://cuidly.com/images/`
- Todos os textos estão em português brasileiro com linguagem neutra
