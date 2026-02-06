import { Section, Text } from '@react-email/components';
import { render } from '@react-email/render';

import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDetailsBox } from '../components/EmailDetailsBox';
import { colors, typography } from '../styles/tokens';

type UserType = 'family' | 'nanny';

interface RenewalEmailProps {
  name: string;
  userType: UserType;
  planName: string;
  billingInterval: string;
  amount: string;
  nextBillingDate: string;
  manageSubscriptionUrl: string;
}

export function RenewalEmail({
  name,
  planName,
  billingInterval,
  amount,
  nextBillingDate,
  manageSubscriptionUrl,
}: RenewalEmailProps) {
  return (
    <EmailLayout previewText={`Assinatura renovada - ${planName}`}>
      <EmailHeading>Assinatura renovada</EmailHeading>

      <EmailText>Olá, {name}!</EmailText>

      <EmailText>
        Sua assinatura do <strong>{planName}</strong> foi renovada automaticamente. Você continua
        com acesso a todos os benefícios premium.
      </EmailText>

      <EmailDetailsBox
        items={[
          { label: 'Plano', value: planName },
          { label: 'Ciclo', value: billingInterval },
          { label: 'Valor cobrado', value: amount, highlight: true },
          { label: 'Próxima cobrança', value: nextBillingDate },
        ]}
      />

      <Section style={{ textAlign: 'center', marginTop: '32px' }}>
        <EmailButton href={manageSubscriptionUrl} variant="outline">
          Gerenciar assinatura
        </EmailButton>
      </Section>

      <Text
        style={{
          marginTop: '24px',
          fontSize: typography.fontSize.sm,
          color: colors.slate[500],
          textAlign: 'center',
        }}
      >
        Este e-mail é um comprovante de pagamento. Guarde-o para seus registros.
      </Text>
    </EmailLayout>
  );
}

export async function getRenewalEmailTemplate(props: RenewalEmailProps) {
  const html = await render(<RenewalEmail {...props} />);
  const text = `
Assinatura renovada

Olá, ${props.name}!

Sua assinatura do ${props.planName} foi renovada automaticamente. Você continua com acesso a todos os benefícios premium.

Detalhes do pagamento:
- Plano: ${props.planName}
- Ciclo: ${props.billingInterval}
- Valor cobrado: ${props.amount}
- Próxima cobrança: ${props.nextBillingDate}

Gerenciar assinatura:
${props.manageSubscriptionUrl}

Este e-mail é um comprovante de pagamento. Guarde-o para seus registros.

---
Cuidly Tecnologia Ltda · Barueri/SP
  `.trim();

  return {
    subject: `Assinatura renovada - ${props.planName}`,
    html,
    text,
  };
}
