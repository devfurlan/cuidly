import { Section, Text } from '@react-email/components';
import { render } from '@react-email/render';

import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailInfoBox } from '../components/EmailInfoBox';
import { colors, typography } from '../styles/tokens';
import { benefits } from '../data/benefits';

type UserType = 'family' | 'nanny';

interface PixExpiredEmailProps {
  name: string;
  userType: UserType;
  planName: string;
  amount: string;
  checkoutUrl: string;
}

export function PixExpiredEmail({
  name,
  userType,
  planName,
  amount,
  checkoutUrl,
}: PixExpiredEmailProps) {
  const userBenefits = benefits[userType];

  return (
    <EmailLayout previewText={`Seu PIX expirou - Gere um novo para ativar o ${planName}`}>
      <EmailHeading>Seu PIX expirou</EmailHeading>

      <EmailText>Olá, {name}!</EmailText>

      <EmailText>
        O PIX que você gerou para assinar o <strong>{planName}</strong> expirou sem ser pago.
      </EmailText>

      <EmailInfoBox>
        <Text
          style={{
            margin: 0,
            fontSize: typography.fontSize.base,
            color: colors.slate[700],
          }}
        >
          Não se preocupe! Você pode gerar um novo PIX a qualquer momento para concluir sua
          assinatura.
        </Text>
      </EmailInfoBox>

      <EmailText>Lembre-se dos benefícios que você terá com o {planName}:</EmailText>

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
        <EmailButton href={checkoutUrl}>Gerar novo PIX</EmailButton>
      </Section>

      <Text
        style={{
          marginTop: '24px',
          fontSize: typography.fontSize.sm,
          color: colors.slate[500],
          textAlign: 'center',
        }}
      >
        Valor: {amount}
      </Text>
    </EmailLayout>
  );
}

export async function getPixExpiredEmailTemplate(props: PixExpiredEmailProps) {
  const html = await render(<PixExpiredEmail {...props} />);
  const text = `
Seu PIX expirou

Olá, ${props.name}!

O PIX que você gerou para assinar o ${props.planName} expirou sem ser pago.

Não se preocupe! Você pode gerar um novo PIX a qualquer momento para concluir sua assinatura.

Gerar novo PIX:
${props.checkoutUrl}

Valor: ${props.amount}

---
Cuidly Tecnologia Ltda · Barueri/SP
  `.trim();

  return {
    subject: `Seu PIX expirou - Gere um novo para ativar o ${props.planName}`,
    html,
    text,
  };
}
