import { Section } from '@react-email/components';
import { render } from '@react-email/render';

import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDetailsBox } from '../components/EmailDetailsBox';
import { EmailBenefitsList } from '../components/EmailBenefitsList';

type UserType = 'family' | 'nanny';

interface ReactivationEmailProps {
  name: string;
  userType: UserType;
  planName: string;
  billingInterval: string;
  amount: string;
  nextBillingDate: string;
  dashboardUrl: string;
}

export function ReactivationEmail({
  name,
  userType,
  planName,
  billingInterval,
  amount,
  nextBillingDate,
  dashboardUrl,
}: ReactivationEmailProps) {
  return (
    <EmailLayout previewText={`Que bom ter você de volta! Sua assinatura foi reativada`}>
      <EmailHeading>Que bom ter você de volta!</EmailHeading>

      <EmailText>Olá, {name}!</EmailText>

      <EmailText>
        Sentimos sua falta! É ótimo ter você de volta. Sua assinatura do <strong>{planName}</strong>{' '}
        foi reativada com sucesso.
      </EmailText>

      <EmailDetailsBox
        items={[
          { label: 'Plano', value: planName },
          { label: 'Ciclo', value: billingInterval },
          { label: 'Valor', value: amount },
          { label: 'Próxima cobrança', value: nextBillingDate },
        ]}
      />

      <EmailText>Você voltou a ter acesso a todos os benefícios:</EmailText>

      <EmailBenefitsList userType={userType} />

      <Section style={{ textAlign: 'center', marginTop: '32px' }}>
        <EmailButton href={dashboardUrl}>Acessar minha conta</EmailButton>
      </Section>
    </EmailLayout>
  );
}

export async function getReactivationEmailTemplate(props: ReactivationEmailProps) {
  const html = await render(<ReactivationEmail {...props} />);
  const text = `
Que bom ter você de volta!

Olá, ${props.name}!

Sentimos sua falta! É ótimo ter você de volta. Sua assinatura do ${props.planName} foi reativada com sucesso.

Detalhes da sua assinatura:
- Plano: ${props.planName}
- Ciclo: ${props.billingInterval}
- Valor: ${props.amount}
- Próxima cobrança: ${props.nextBillingDate}

Acessar minha conta:
${props.dashboardUrl}

---
Cuidly Tecnologia Ltda · Barueri/SP
  `.trim();

  return {
    subject: `Que bom ter você de volta! Sua assinatura foi reativada`,
    html,
    text,
  };
}
