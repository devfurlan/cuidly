import { Section, Text } from '@react-email/components';
import { render } from '@react-email/render';

import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailBenefitsList } from '../components/EmailBenefitsList';
import { colors, typography } from '../styles/tokens';

type UserType = 'family' | 'nanny';

interface CanceledEmailProps {
  name: string;
  userType: UserType;
  planName: string;
  reactivateUrl: string;
}

export function CanceledEmail({ name, userType, planName, reactivateUrl }: CanceledEmailProps) {
  return (
    <EmailLayout previewText={`Seu plano ${planName} foi encerrado`}>
      <EmailHeading>Seu plano foi encerrado</EmailHeading>

      <EmailText>Olá, {name}!</EmailText>

      <EmailText>
        Seu plano <strong>{planName}</strong> foi encerrado. Você agora está no plano gratuito.
      </EmailText>

      <EmailText>Sentimos sua falta! Com o {planName}, você tinha acesso a:</EmailText>

      <EmailBenefitsList userType={userType} />

      <Section style={{ textAlign: 'center', marginTop: '32px' }}>
        <EmailButton href={reactivateUrl}>Reativar meu plano</EmailButton>
      </Section>

      <Text
        style={{
          marginTop: '24px',
          fontSize: typography.fontSize.sm,
          color: colors.slate[500],
          textAlign: 'center',
        }}
      >
        Você pode reativar seu plano a qualquer momento.
      </Text>
    </EmailLayout>
  );
}

export async function getCanceledEmailTemplate(props: CanceledEmailProps) {
  const html = await render(<CanceledEmail {...props} />);
  const text = `
Seu plano foi encerrado

Olá, ${props.name}!

Seu plano ${props.planName} foi encerrado. Você agora está no plano gratuito.

Reativar meu plano:
${props.reactivateUrl}

Você pode reativar seu plano a qualquer momento.

---
Cuidly Tecnologia Ltda · Barueri/SP
  `.trim();

  return {
    subject: `Seu plano ${props.planName} foi encerrado`,
    html,
    text,
  };
}
