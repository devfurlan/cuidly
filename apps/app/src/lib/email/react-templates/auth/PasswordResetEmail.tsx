import { Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import { EmailLayout } from '../components/EmailLayout';
import { EmailButton } from '../components/EmailButton';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailInfoBox } from '../components/EmailInfoBox';
import { colors, typography } from '../styles/tokens';

interface PasswordResetEmailProps {
  name: string;
  resetLink: string;
}

export function PasswordResetEmail({ name, resetLink }: PasswordResetEmailProps) {
  return (
    <EmailLayout previewText="Recuperação de senha - Cuidly">
      <Section>
        <EmailHeading as="h2">Recuperação de senha</EmailHeading>

        <EmailText>
          Olá, {name}! Recebemos uma solicitação para redefinir a senha da sua
          conta na Cuidly. Clique no botão abaixo para criar uma nova senha:
        </EmailText>
      </Section>

      <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <EmailButton href={resetLink}>Redefinir senha</EmailButton>
      </Section>

      <EmailInfoBox variant="warning">
        Este link expira em <strong>1 hora</strong> por questões de segurança. Se
        você não solicitou a recuperação de senha, ignore este e-mail. Sua senha
        permanecerá a mesma.
      </EmailInfoBox>

      <Section style={{ marginTop: '24px' }}>
        <Text
          style={{
            color: colors.slate[500],
            fontSize: typography.fontSize.sm,
            margin: '0 0 8px 0',
          }}
        >
          Se o botão não funcionar, copie e cole este link no seu navegador:
        </Text>
        <Text
          style={{
            color: colors.slate[400],
            fontSize: typography.fontSize.xs,
            margin: 0,
            wordBreak: 'break-all' as const,
          }}
        >
          {resetLink}
        </Text>
      </Section>
    </EmailLayout>
  );
}

export async function getPasswordResetEmailTemplate(
  data: PasswordResetEmailProps,
) {
  const emailComponent = <PasswordResetEmail {...data} />;

  return {
    subject: 'Recuperação de senha - Cuidly',
    html: await render(emailComponent),
    text: await render(emailComponent, { plainText: true }),
  };
}

export default PasswordResetEmail;
