import { Section, Text } from '@react-email/components';
import { render } from '@react-email/render';

import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailBenefitsList } from '../components/EmailBenefitsList';
import { typography } from '../styles/tokens';

type UserType = 'family' | 'nanny';

interface Reminder5DaysEmailProps {
  name: string;
  userType: UserType;
  planName: string;
  accessUntilDate: string;
  revertCancelUrl: string;
}

export function Reminder5DaysEmail({
  name,
  userType,
  planName,
  accessUntilDate,
  revertCancelUrl,
}: Reminder5DaysEmailProps) {
  return (
    <EmailLayout previewText={`Faltam 5 dias para você perder acesso ao ${planName}`}>
      <EmailHeading>Faltam 5 dias</EmailHeading>

      <EmailText>Olá, {name}!</EmailText>

      <EmailText>
        Só passando para lembrar: seu plano <strong>{planName}</strong> será encerrado em{' '}
        <strong>5 dias</strong>.
      </EmailText>

      <Section
        style={{
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          padding: '24px',
          margin: '24px 0',
          textAlign: 'center',
          border: '2px solid #d97706',
        }}
      >
        <Text
          style={{
            margin: '0 0 8px 0',
            fontSize: typography.fontSize.sm,
            fontWeight: 600,
            color: '#92400e',
          }}
        >
          Seu acesso termina em:
        </Text>
        <Text
          style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 700,
            color: '#b45309',
          }}
        >
          {accessUntilDate}
        </Text>
      </Section>

      <EmailText>Você ainda pode aproveitar esses benefícios por mais tempo:</EmailText>

      <EmailBenefitsList userType={userType} />

      <Section style={{ textAlign: 'center', marginTop: '32px' }}>
        <EmailButton href={revertCancelUrl}>Manter meu plano</EmailButton>
      </Section>
    </EmailLayout>
  );
}

export async function getReminder5DaysEmailTemplate(props: Reminder5DaysEmailProps) {
  const html = await render(<Reminder5DaysEmail {...props} />);
  const text = `
Faltam 5 dias

Olá, ${props.name}!

Só passando para lembrar: seu plano ${props.planName} será encerrado em 5 dias.

Seu acesso termina em: ${props.accessUntilDate}

Manter meu plano:
${props.revertCancelUrl}

---
Cuidly Tecnologia Ltda · Barueri/SP
  `.trim();

  return {
    subject: `Faltam 5 dias para você perder acesso ao ${props.planName}`,
    html,
    text,
  };
}
