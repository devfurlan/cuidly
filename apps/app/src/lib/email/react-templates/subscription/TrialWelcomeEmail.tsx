import { Section, Text } from '@react-email/components';
import { render } from '@react-email/render';

import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailInfoBox } from '../components/EmailInfoBox';
import { EmailBenefitsList } from '../components/EmailBenefitsList';
import { colors, typography } from '../styles/tokens';

type UserType = 'family' | 'nanny';

interface TrialWelcomeEmailProps {
  name: string;
  userType: UserType;
  planName: string;
  trialDays: number;
  trialEndDate: string;
  dashboardUrl: string;
}

export function TrialWelcomeEmail({
  name,
  userType,
  planName,
  trialDays,
  trialEndDate,
  dashboardUrl,
}: TrialWelcomeEmailProps) {
  return (
    <EmailLayout previewText={`Seu período de teste de ${trialDays} dias começou!`}>
      <EmailHeading>Seu período de teste começou!</EmailHeading>

      <EmailText>Olá, {name}!</EmailText>

      <EmailText>
        Você ativou o período de teste gratuito do <strong>{planName}</strong>. Aproveite todos os
        benefícios premium durante {trialDays} dias.
      </EmailText>

      <EmailInfoBox>
        <Text
          style={{
            margin: '0 0 8px 0',
            fontSize: typography.fontSize.sm,
            fontWeight: 600,
            color: colors.slate[700],
          }}
        >
          Seu período de teste termina em:
        </Text>
        <Text
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 700,
            color: colors.fuchsia[600],
          }}
        >
          {trialEndDate}
        </Text>
        <Text
          style={{
            margin: '16px 0 0 0',
            fontSize: typography.fontSize.sm,
            color: colors.slate[500],
          }}
        >
          Após essa data, sua assinatura será cobrada automaticamente.
        </Text>
      </EmailInfoBox>

      <EmailText>Durante o período de teste, você tem acesso a:</EmailText>

      <EmailBenefitsList userType={userType} />

      <Section style={{ textAlign: 'center', marginTop: '32px' }}>
        <EmailButton href={dashboardUrl}>Começar a usar agora</EmailButton>
      </Section>
    </EmailLayout>
  );
}

export async function getTrialWelcomeEmailTemplate(props: TrialWelcomeEmailProps) {
  const html = await render(<TrialWelcomeEmail {...props} />);
  const text = `
Seu período de teste começou!

Olá, ${props.name}!

Você ativou o período de teste gratuito do ${props.planName}. Aproveite todos os benefícios premium durante ${props.trialDays} dias.

Seu período de teste termina em: ${props.trialEndDate}

Após essa data, sua assinatura será cobrada automaticamente.

Começar a usar agora:
${props.dashboardUrl}

---
Cuidly Tecnologia Ltda · Barueri/SP
  `.trim();

  return {
    subject: `Seu período de teste de ${props.trialDays} dias começou!`,
    html,
    text,
  };
}
