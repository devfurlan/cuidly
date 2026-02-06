import { Section } from '@react-email/components';
import { render } from '@react-email/render';
import { EmailLayout } from '../components/EmailLayout';
import { EmailButton } from '../components/EmailButton';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailBenefitsList } from '../components/EmailBenefitsList';
import { EmailDetailsBox } from '../components/EmailDetailsBox';
import { benefitsByUserType, type UserType } from '../data/benefits';

interface WelcomeSubscriptionEmailProps {
  name: string;
  userType: UserType;
  planName: string;
  billingInterval: string;
  amount: string;
  nextBillingDate: string;
  dashboardUrl: string;
}

export function WelcomeSubscriptionEmail({
  name,
  userType,
  planName,
  billingInterval,
  amount,
  nextBillingDate,
  dashboardUrl,
}: WelcomeSubscriptionEmailProps) {
  const benefits = benefitsByUserType[userType];

  return (
    <EmailLayout previewText={`Boas-vindas ao ${planName}! Sua assinatura está ativa.`}>
      <Section>
        <EmailHeading as="h2">Boas-vindas ao {planName}!</EmailHeading>

        <EmailText>
          Olá, {name}! Agradecemos por assinar o <strong>{planName}</strong>.
          Agora você tem acesso a todos os recursos premium da Cuidly.
        </EmailText>
      </Section>

      <EmailDetailsBox
        title="Detalhes da sua assinatura"
        titleIcon="📋"
        variant="success"
        items={[
          { label: 'Plano', value: planName },
          { label: 'Ciclo', value: billingInterval },
          { label: 'Valor', value: amount },
          { label: 'Próxima cobrança', value: nextBillingDate },
        ]}
      />

      <Section>
        <EmailText>Agora você tem acesso a:</EmailText>
      </Section>

      <EmailBenefitsList benefits={benefits} />

      <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <EmailButton href={dashboardUrl}>Acessar minha conta</EmailButton>
      </Section>
    </EmailLayout>
  );
}

export async function getWelcomeSubscriptionEmailTemplate(
  data: WelcomeSubscriptionEmailProps,
) {
  const emailComponent = <WelcomeSubscriptionEmail {...data} />;

  return {
    subject: `Boas-vindas ao ${data.planName}!`,
    html: await render(emailComponent),
    text: await render(emailComponent, { plainText: true }),
  };
}

export default WelcomeSubscriptionEmail;
