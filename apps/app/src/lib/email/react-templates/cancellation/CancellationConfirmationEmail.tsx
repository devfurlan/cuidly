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

interface CancellationConfirmationEmailProps {
  name: string;
  userType: UserType;
  planName: string;
  accessUntilDate: string;
  revertCancelUrl: string;
}

export function CancellationConfirmationEmail({
  name,
  userType,
  planName,
  accessUntilDate,
  revertCancelUrl,
}: CancellationConfirmationEmailProps) {
  return (
    <EmailLayout previewText={`Seu plano ${planName} foi cancelado`}>
      <EmailHeading>Cancelamento Confirmado</EmailHeading>

      <EmailText>Olá, {name}!</EmailText>

      <EmailText>
        Confirmamos o cancelamento do seu plano <strong>{planName}</strong>.
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
          Você ainda tem acesso até:
        </Text>
        <Text
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 700,
            color: colors.fuchsia[600],
          }}
        >
          {accessUntilDate}
        </Text>
      </EmailInfoBox>

      <EmailText>Após essa data, você perderá acesso aos seguintes benefícios:</EmailText>

      <EmailBenefitsList userType={userType} />

      <Section style={{ textAlign: 'center', marginTop: '32px' }}>
        <EmailButton href={revertCancelUrl}>Mudou de ideia? Manter meu plano</EmailButton>
      </Section>

      <Text
        style={{
          marginTop: '24px',
          fontSize: typography.fontSize.sm,
          color: colors.slate[500],
          textAlign: 'center',
        }}
      >
        Você pode reverter o cancelamento a qualquer momento antes de {accessUntilDate}.
      </Text>
    </EmailLayout>
  );
}

export async function getCancellationConfirmationEmailTemplate(
  props: CancellationConfirmationEmailProps
) {
  const html = await render(<CancellationConfirmationEmail {...props} />);
  const text = `
Cancelamento Confirmado

Olá, ${props.name}!

Confirmamos o cancelamento do seu plano ${props.planName}.

Você ainda tem acesso até: ${props.accessUntilDate}

Mudou de ideia? Mantenha seu plano acessando:
${props.revertCancelUrl}

Você pode reverter o cancelamento a qualquer momento antes de ${props.accessUntilDate}.

---
Cuidly Tecnologia Ltda · Barueri/SP
  `.trim();

  return {
    subject: `Seu plano ${props.planName} foi cancelado`,
    html,
    text,
  };
}
