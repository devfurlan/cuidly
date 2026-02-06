import { Section, Text, Link } from '@react-email/components';
import { render } from '@react-email/render';

import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { colors, typography } from '../styles/tokens';

type UserType = 'family' | 'nanny';

interface PaymentReceiptEmailProps {
  name: string;
  userType: UserType;
  planName: string;
  billingInterval: string;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  invoiceUrl?: string;
  nextBillingDate: string;
  manageSubscriptionUrl: string;
}

export function PaymentReceiptEmail({
  name,
  planName,
  billingInterval,
  amount,
  paymentDate,
  paymentMethod,
  invoiceUrl,
  nextBillingDate,
  manageSubscriptionUrl,
}: PaymentReceiptEmailProps) {
  return (
    <EmailLayout previewText={`Recibo de pagamento - ${planName}`}>
      <EmailHeading>Pagamento confirmado</EmailHeading>

      <EmailText>Olá, {name}!</EmailText>

      <EmailText>Confirmamos o recebimento do seu pagamento. Agradecemos por continuar com a Cuidly!</EmailText>

      {/* Receipt Box */}
      <Section
        style={{
          backgroundColor: colors.slate[50],
          borderRadius: '8px',
          padding: '24px',
          margin: '24px 0',
          border: `1px solid ${colors.slate[200]}`,
        }}
      >
        <Text
          style={{
            margin: '0 0 20px 0',
            fontSize: typography.fontSize.lg,
            fontWeight: 700,
            color: colors.slate[900],
            textAlign: 'center',
            borderBottom: `1px solid ${colors.slate[200]}`,
            paddingBottom: '16px',
          }}
        >
          Recibo de Pagamento
        </Text>

        <table width="100%" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td
                style={{
                  padding: '10px 0',
                  color: colors.slate[600],
                  fontSize: typography.fontSize.sm,
                }}
              >
                Data:
              </td>
              <td
                style={{
                  padding: '10px 0',
                  color: colors.slate[900],
                  fontSize: typography.fontSize.sm,
                  fontWeight: 600,
                  textAlign: 'right',
                }}
              >
                {paymentDate}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: '10px 0',
                  color: colors.slate[600],
                  fontSize: typography.fontSize.sm,
                }}
              >
                Plano:
              </td>
              <td
                style={{
                  padding: '10px 0',
                  color: colors.slate[900],
                  fontSize: typography.fontSize.sm,
                  fontWeight: 600,
                  textAlign: 'right',
                }}
              >
                {planName}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: '10px 0',
                  color: colors.slate[600],
                  fontSize: typography.fontSize.sm,
                }}
              >
                Ciclo:
              </td>
              <td
                style={{
                  padding: '10px 0',
                  color: colors.slate[900],
                  fontSize: typography.fontSize.sm,
                  fontWeight: 600,
                  textAlign: 'right',
                }}
              >
                {billingInterval}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: '10px 0',
                  color: colors.slate[600],
                  fontSize: typography.fontSize.sm,
                }}
              >
                Forma de pagamento:
              </td>
              <td
                style={{
                  padding: '10px 0',
                  color: colors.slate[900],
                  fontSize: typography.fontSize.sm,
                  fontWeight: 600,
                  textAlign: 'right',
                }}
              >
                {paymentMethod}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: '14px 0 10px 0',
                  color: colors.slate[600],
                  fontSize: typography.fontSize.sm,
                  borderTop: `1px solid ${colors.slate[200]}`,
                }}
              >
                Valor pago:
              </td>
              <td
                style={{
                  padding: '14px 0 10px 0',
                  color: '#16a34a',
                  fontSize: '18px',
                  fontWeight: 700,
                  textAlign: 'right',
                  borderTop: `1px solid ${colors.slate[200]}`,
                }}
              >
                {amount}
              </td>
            </tr>
          </tbody>
        </table>

        {invoiceUrl && (
          <Section style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link
              href={invoiceUrl}
              style={{
                color: colors.fuchsia[600],
                fontSize: typography.fontSize.sm,
                textDecoration: 'underline',
              }}
            >
              Ver fatura completa
            </Link>
          </Section>
        )}
      </Section>

      {/* Next billing */}
      <Section
        style={{
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          padding: '16px',
          margin: '24px 0',
        }}
      >
        <Text
          style={{
            margin: 0,
            fontSize: typography.fontSize.sm,
            color: '#166534',
            textAlign: 'center',
          }}
        >
          Próxima cobrança: <strong>{nextBillingDate}</strong>
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', marginTop: '32px' }}>
        <EmailButton href={manageSubscriptionUrl} variant="outline">
          Gerenciar assinatura
        </EmailButton>
      </Section>
    </EmailLayout>
  );
}

export async function getPaymentReceiptEmailTemplate(props: PaymentReceiptEmailProps) {
  const html = await render(<PaymentReceiptEmail {...props} />);
  const invoiceText = props.invoiceUrl ? `\nVer fatura completa: ${props.invoiceUrl}` : '';
  const text = `
Pagamento confirmado

Olá, ${props.name}!

Confirmamos o recebimento do seu pagamento. Agradecemos por continuar com a Cuidly!

Recibo de Pagamento
- Data: ${props.paymentDate}
- Plano: ${props.planName}
- Ciclo: ${props.billingInterval}
- Forma de pagamento: ${props.paymentMethod}
- Valor pago: ${props.amount}${invoiceText}

Próxima cobrança: ${props.nextBillingDate}

Gerenciar assinatura:
${props.manageSubscriptionUrl}

---
Cuidly Tecnologia Ltda · Barueri/SP
  `.trim();

  return {
    subject: `Recibo de pagamento - ${props.planName}`,
    html,
    text,
  };
}
