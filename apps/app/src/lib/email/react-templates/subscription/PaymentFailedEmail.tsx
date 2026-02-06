import { Section } from '@react-email/components';
import { render } from '@react-email/render';
import { EmailButton } from '../components/EmailButton';
import { EmailDetailsBox } from '../components/EmailDetailsBox';
import { EmailHeading } from '../components/EmailHeading';
import { EmailInfoBox } from '../components/EmailInfoBox';
import { EmailLayout } from '../components/EmailLayout';
import { EmailText } from '../components/EmailText';
import { type UserType } from '../data/benefits';

interface PaymentFailedEmailProps {
  name: string;
  userType: UserType;
  planName: string;
  amount: string;
  updatePaymentUrl: string;
}

export function PaymentFailedEmail({
  name,
  planName,
  amount,
  updatePaymentUrl,
}: PaymentFailedEmailProps) {
  return (
    <EmailLayout previewText={`Problema no pagamento - ${planName}`}>
      <Section>
        <EmailHeading as="h2">Problema no pagamento</EmailHeading>

        <EmailText>
          Olá, {name}! Houve um problema ao processar o pagamento da sua
          assinatura do <strong>{planName}</strong>.
        </EmailText>
      </Section>

      <EmailDetailsBox
        title="Detalhes da cobrança"
        titleIcon="📋"
        variant="warning"
        items={[
          { label: 'Plano', value: planName },
          { label: 'Valor', value: amount },
        ]}
      />

      <Section>
        <EmailText>
          Tentaremos processar o pagamento novamente automaticamente. Para
          evitar a suspensão do seu acesso aos recursos premium, verifique sua
          forma de pagamento.
        </EmailText>
      </Section>

      <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <EmailButton href={updatePaymentUrl}>
          Verificar forma de pagamento
        </EmailButton>
      </Section>

      <EmailInfoBox variant="default">
        Se o pagamento não for regularizado, seu acesso aos recursos premium
        será suspenso.
      </EmailInfoBox>
    </EmailLayout>
  );
}

export async function getPaymentFailedEmailTemplate(
  data: PaymentFailedEmailProps,
) {
  const emailComponent = <PaymentFailedEmail {...data} />;

  return {
    subject: `Problema no pagamento - ${data.planName}`,
    html: await render(emailComponent),
    text: await render(emailComponent, { plainText: true }),
  };
}

export default PaymentFailedEmail;
