import { Section, Text } from '@react-email/components';
import { render } from '@react-email/render';

import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailBenefitsList } from '../components/EmailBenefitsList';
import { colors, typography } from '../styles/tokens';

type UserType = 'family' | 'nanny';

interface CanceledWithWinbackEmailProps {
  name: string;
  userType: UserType;
  planName: string;
  reactivateUrl: string;
  couponCode: string;
  couponDiscount: string;
  couponExpirationDate: string;
}

export function CanceledWithWinbackEmail({
  name,
  userType,
  planName,
  reactivateUrl,
  couponCode,
  couponDiscount,
  couponExpirationDate,
}: CanceledWithWinbackEmailProps) {
  return (
    <EmailLayout previewText={`Seu plano foi encerrado - Volte com ${couponDiscount} OFF`}>
      <EmailHeading>Seu plano foi encerrado</EmailHeading>

      <EmailText>Olá, {name}!</EmailText>

      <EmailText>
        Seu plano <strong>{planName}</strong> foi encerrado. Você agora está no plano gratuito.
      </EmailText>

      {/* Coupon Box */}
      <Section
        style={{
          backgroundColor: colors.fuchsia[500],
          borderRadius: '12px',
          padding: '32px',
          margin: '24px 0',
          textAlign: 'center',
        }}
      >
        <Text
          style={{
            margin: '0 0 8px 0',
            fontSize: typography.fontSize.sm,
            fontWeight: 600,
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Oferta especial para você
        </Text>
        <Text
          style={{
            margin: '0 0 16px 0',
            fontSize: '36px',
            fontWeight: 700,
            color: '#ffffff',
          }}
        >
          {couponDiscount} OFF
        </Text>
        <Text
          style={{
            margin: '0 0 20px 0',
            fontSize: typography.fontSize.sm,
            color: colors.fuchsia[100],
          }}
        >
          na primeira mensalidade ao reativar seu plano
        </Text>
        <Section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '12px 24px',
            display: 'inline-block',
          }}
        >
          <Text
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              color: colors.fuchsia[700],
              fontFamily: "'Courier New', monospace",
              letterSpacing: '2px',
            }}
          >
            {couponCode}
          </Text>
        </Section>
        <Text
          style={{
            margin: '16px 0 0 0',
            fontSize: typography.fontSize.xs,
            color: colors.fuchsia[100],
          }}
        >
          Válido até {couponExpirationDate}
        </Text>
      </Section>

      <EmailText>Sentimos sua falta! Com o {planName}, você tinha acesso a:</EmailText>

      <EmailBenefitsList userType={userType} />

      <Section style={{ textAlign: 'center', marginTop: '32px' }}>
        <EmailButton href={reactivateUrl}>Reativar com {couponDiscount} de desconto</EmailButton>
      </Section>

      <Text
        style={{
          marginTop: '24px',
          fontSize: typography.fontSize.sm,
          color: colors.slate[500],
          textAlign: 'center',
        }}
      >
        Use o cupom <strong>{couponCode}</strong> no checkout. Válido até {couponExpirationDate}.
      </Text>
    </EmailLayout>
  );
}

export async function getCanceledWithWinbackEmailTemplate(props: CanceledWithWinbackEmailProps) {
  const html = await render(<CanceledWithWinbackEmail {...props} />);
  const text = `
Seu plano foi encerrado

Olá, ${props.name}!

Seu plano ${props.planName} foi encerrado. Você agora está no plano gratuito.

OFERTA ESPECIAL PARA VOCÊ

${props.couponDiscount} OFF na primeira mensalidade ao reativar seu plano

Cupom: ${props.couponCode}
Válido até: ${props.couponExpirationDate}

Reativar com desconto:
${props.reactivateUrl}

Use o cupom ${props.couponCode} no checkout.

---
Cuidly Tecnologia Ltda · Barueri/SP
  `.trim();

  return {
    subject: `Seu plano foi encerrado - Volte com ${props.couponDiscount} OFF`,
    html,
    text,
  };
}
