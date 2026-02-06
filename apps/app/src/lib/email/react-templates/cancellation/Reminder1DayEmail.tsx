import { Section, Text } from '@react-email/components';
import { render } from '@react-email/render';

import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { colors, typography } from '../styles/tokens';
import { benefits } from '../data/benefits';

type UserType = 'family' | 'nanny';

interface Reminder1DayEmailProps {
  name: string;
  userType: UserType;
  planName: string;
  accessUntilDate: string;
  revertCancelUrl: string;
}

export function Reminder1DayEmail({
  name,
  userType,
  planName,
  accessUntilDate,
  revertCancelUrl,
}: Reminder1DayEmailProps) {
  const userBenefits = benefits[userType];

  return (
    <EmailLayout previewText={`Amanhã você perde acesso ao ${planName}`}>
      <Section
        style={{
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'center',
          border: '2px solid #dc2626',
        }}
      >
        <Text
          style={{
            margin: 0,
            fontSize: typography.fontSize.lg,
            fontWeight: 700,
            color: '#dc2626',
          }}
        >
          ÚLTIMA CHANCE
        </Text>
      </Section>

      <EmailHeading>Último dia!</EmailHeading>

      <EmailText>Olá, {name}!</EmailText>

      <EmailText>
        Amanhã, <strong>{accessUntilDate}</strong>, seu plano <strong>{planName}</strong> será
        encerrado definitivamente.
      </EmailText>

      <EmailText>Esta é sua última chance de manter seus benefícios:</EmailText>

      <Section
        style={{
          backgroundColor: colors.slate[50],
          borderRadius: '8px',
          padding: '16px',
          margin: '24px 0',
        }}
      >
        {userBenefits.map((benefit, index) => (
          <Text
            key={index}
            style={{
              margin: index < userBenefits.length - 1 ? '0 0 8px 0' : 0,
              fontSize: typography.fontSize.sm,
              color: colors.slate[700],
            }}
          >
            {benefit.icon} <strong>{benefit.title}</strong>
          </Text>
        ))}
      </Section>

      <Section style={{ textAlign: 'center', marginTop: '32px' }}>
        <EmailButton href={revertCancelUrl}>Manter meu plano agora</EmailButton>
      </Section>

      <Text
        style={{
          marginTop: '24px',
          fontSize: typography.fontSize.sm,
          color: colors.slate[500],
          textAlign: 'center',
        }}
      >
        Após amanhã, você voltará para o plano gratuito.
      </Text>
    </EmailLayout>
  );
}

export async function getReminder1DayEmailTemplate(props: Reminder1DayEmailProps) {
  const html = await render(<Reminder1DayEmail {...props} />);
  const text = `
ÚLTIMO DIA!

Olá, ${props.name}!

ÚLTIMA CHANCE

Amanhã, ${props.accessUntilDate}, seu plano ${props.planName} será encerrado definitivamente.

MANTER MEU PLANO AGORA:
${props.revertCancelUrl}

Após amanhã, você voltará para o plano gratuito.

---
Cuidly Tecnologia Ltda · Barueri/SP
  `.trim();

  return {
    subject: `Amanhã você perde acesso ao ${props.planName}`,
    html,
    text,
  };
}
