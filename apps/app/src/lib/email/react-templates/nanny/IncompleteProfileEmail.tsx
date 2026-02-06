import { Section, Text } from '@react-email/components';
import { render } from '@react-email/render';

import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { colors, typography } from '../styles/tokens';

interface IncompleteProfileEmailProps {
  name: string;
  completionPercentage: number;
  missingItems: string[];
  completeProfileUrl: string;
}

const completionBenefits = [
  { icon: '🏅', text: 'Recebe o selo "Identificada"' },
  { icon: '👀', text: 'Aparece nas buscas das famílias' },
  { icon: '📈', text: 'Aumenta suas chances de contratação' },
];

export function IncompleteProfileEmail({
  name,
  completionPercentage,
  missingItems,
  completeProfileUrl,
}: IncompleteProfileEmailProps) {
  const filledWidth = Math.min(completionPercentage, 100);

  return (
    <EmailLayout previewText="Complete seu perfil e aumente suas chances de contratação">
      <EmailHeading>Complete seu perfil</EmailHeading>

      <EmailText>Olá, {name}!</EmailText>

      <EmailText>
        Notamos que seu perfil ainda não está completo. Complete-o para aumentar suas chances de ser
        encontrada pelas famílias!
      </EmailText>

      {/* Progress Bar */}
      <Section
        style={{
          backgroundColor: colors.slate[50],
          borderRadius: '8px',
          padding: '24px',
          margin: '24px 0',
        }}
      >
        <Text
          style={{
            margin: '0 0 8px 0',
            fontSize: typography.fontSize.base,
            fontWeight: 600,
            color: colors.slate[900],
            textAlign: 'center',
          }}
        >
          Seu perfil está
        </Text>

        {/* Progress bar container */}
        <Section
          style={{
            backgroundColor: colors.slate[200],
            borderRadius: '8px',
            height: '12px',
            margin: '16px 0',
            overflow: 'hidden',
          }}
        >
          <Section
            style={{
              backgroundColor: colors.fuchsia[500],
              width: `${filledWidth}%`,
              height: '12px',
              borderRadius: '8px',
            }}
          />
        </Section>

        <Text
          style={{
            margin: 0,
            fontSize: typography.fontSize.base,
            textAlign: 'center',
          }}
        >
          <span style={{ color: colors.fuchsia[600], fontWeight: 700 }}>{completionPercentage}%</span>{' '}
          <span style={{ color: colors.slate[600] }}>completo</span>
        </Text>
      </Section>

      {/* Missing Items */}
      <Section
        style={{
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          padding: '24px',
          margin: '24px 0',
          borderLeft: '4px solid #f59e0b',
        }}
      >
        <Text
          style={{
            margin: '0 0 16px 0',
            fontSize: typography.fontSize.base,
            fontWeight: 600,
            color: '#92400e',
          }}
        >
          Falta preencher:
        </Text>
        {missingItems.slice(0, 5).map((item, index) => (
          <Text
            key={index}
            style={{
              margin: index < missingItems.length - 1 ? '0 0 8px 0' : 0,
              fontSize: typography.fontSize.sm,
              color: colors.slate[900],
            }}
          >
            <span style={{ color: colors.fuchsia[600], marginRight: '8px' }}>•</span>
            {item}
          </Text>
        ))}
      </Section>

      {/* Benefits */}
      <Section
        style={{
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          padding: '24px',
          margin: '24px 0',
          borderLeft: '4px solid #22c55e',
        }}
      >
        <Text
          style={{
            margin: '0 0 16px 0',
            fontSize: typography.fontSize.base,
            fontWeight: 600,
            color: '#166534',
          }}
        >
          Ao completar, você:
        </Text>
        {completionBenefits.map((benefit, index) => (
          <Text
            key={index}
            style={{
              margin: index < completionBenefits.length - 1 ? '0 0 8px 0' : 0,
              fontSize: typography.fontSize.sm,
              color: colors.slate[900],
            }}
          >
            <span style={{ marginRight: '8px' }}>{benefit.icon}</span>
            {benefit.text}
          </Text>
        ))}
      </Section>

      <Section style={{ textAlign: 'center', marginTop: '32px' }}>
        <EmailButton href={completeProfileUrl}>Completar meu perfil</EmailButton>
      </Section>

      <Section
        style={{
          backgroundColor: colors.slate[50],
          borderRadius: '8px',
          padding: '16px',
          margin: '24px 0',
        }}
      >
        <Text
          style={{
            margin: 0,
            fontSize: typography.fontSize.sm,
            color: colors.slate[600],
            textAlign: 'center',
          }}
        >
          Leva menos de 5 minutos!
        </Text>
      </Section>
    </EmailLayout>
  );
}

export async function getIncompleteProfileEmailTemplate(props: IncompleteProfileEmailProps) {
  const html = await render(<IncompleteProfileEmail {...props} />);
  const text = `
Complete seu perfil

Olá, ${props.name}!

Notamos que seu perfil ainda não está completo. Complete-o para aumentar suas chances de ser encontrada pelas famílias!

Seu perfil está ${props.completionPercentage}% completo.

Falta preencher:
${props.missingItems
  .slice(0, 5)
  .map((item) => `• ${item}`)
  .join('\n')}

Ao completar, você:
• Recebe o selo "Identificada"
• Aparece nas buscas das famílias
• Aumenta suas chances de contratação

Completar meu perfil:
${props.completeProfileUrl}

Leva menos de 5 minutos!

---
Cuidly Tecnologia Ltda · Barueri/SP
  `.trim();

  return {
    subject: 'Complete seu perfil e aumente suas chances de contratação',
    html,
    text,
  };
}
