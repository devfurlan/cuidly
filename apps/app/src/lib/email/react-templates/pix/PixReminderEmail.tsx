import { Section, Text } from '@react-email/components';
import { render } from '@react-email/render';

import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDetailsBox } from '../components/EmailDetailsBox';
import { colors, typography } from '../styles/tokens';
import { benefits } from '../data/benefits';

type UserType = 'family' | 'nanny';

interface PixReminderEmailProps {
  name: string;
  userType: UserType;
  planName: string;
  amount: string;
  pixCopyPaste: string;
  pixExpiresAt: string;
  checkoutUrl: string;
}

export function PixReminderEmail({
  name,
  userType,
  planName,
  amount,
  pixCopyPaste,
  pixExpiresAt,
  checkoutUrl,
}: PixReminderEmailProps) {
  const userBenefits = benefits[userType];

  return (
    <EmailLayout previewText={`Seu PIX está esperando - Complete a assinatura do ${planName}`}>
      <EmailHeading>Seu PIX está esperando!</EmailHeading>

      <EmailText>Olá, {name}!</EmailText>

      <EmailText>
        Notamos que você iniciou a assinatura do <strong>{planName}</strong> mas ainda não
        completou o pagamento via PIX.
      </EmailText>

      <EmailDetailsBox
        items={[
          { label: 'Plano', value: planName },
          { label: 'Valor', value: amount },
          { label: 'Expira em', value: pixExpiresAt, highlight: true },
        ]}
      />

      {/* PIX Copia e Cola */}
      <Section
        style={{
          backgroundColor: colors.slate[50],
          borderRadius: '8px',
          padding: '20px',
          margin: '24px 0',
          textAlign: 'center',
        }}
      >
        <Text
          style={{
            margin: '0 0 12px 0',
            fontSize: typography.fontSize.sm,
            fontWeight: 600,
            color: colors.slate[700],
          }}
        >
          PIX Copia e Cola:
        </Text>
        <Section
          style={{
            backgroundColor: '#ffffff',
            border: `1px solid ${colors.slate[200]}`,
            borderRadius: '8px',
            padding: '12px',
            wordBreak: 'break-all',
          }}
        >
          <Text
            style={{
              margin: 0,
              fontSize: typography.fontSize.xs,
              fontFamily: "'Courier New', monospace",
              color: colors.slate[600],
            }}
          >
            {pixCopyPaste}
          </Text>
        </Section>
        <Text
          style={{
            margin: '12px 0 0 0',
            fontSize: typography.fontSize.xs,
            color: colors.slate[500],
          }}
        >
          Copie o código acima e cole no app do seu banco
        </Text>
      </Section>

      <EmailText>Com o {planName}, você terá acesso a:</EmailText>

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
        <EmailButton href={checkoutUrl}>Ver QR Code do PIX</EmailButton>
      </Section>

      <Text
        style={{
          marginTop: '24px',
          fontSize: typography.fontSize.sm,
          color: colors.slate[500],
          textAlign: 'center',
        }}
      >
        Se você já pagou, desconsidere este e-mail. O sistema será atualizado automaticamente.
      </Text>
    </EmailLayout>
  );
}

export async function getPixReminderEmailTemplate(props: PixReminderEmailProps) {
  const html = await render(<PixReminderEmail {...props} />);
  const text = `
Seu PIX está esperando!

Olá, ${props.name}!

Notamos que você iniciou a assinatura do ${props.planName} mas ainda não completou o pagamento via PIX.

Detalhes do pagamento:
- Plano: ${props.planName}
- Valor: ${props.amount}
- Expira em: ${props.pixExpiresAt}

PIX Copia e Cola:
${props.pixCopyPaste}

Ver QR Code do PIX:
${props.checkoutUrl}

Se você já pagou, desconsidere este e-mail.

---
Cuidly Tecnologia Ltda · Barueri/SP
  `.trim();

  return {
    subject: `Seu PIX está esperando - Complete a assinatura do ${props.planName}`,
    html,
    text,
  };
}
