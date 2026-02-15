import { Section } from '@react-email/components';
import { render } from '@react-email/render';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';

interface TicketReplyEmailProps {
  name: string;
  subject: string;
  messagePreview: string;
  ticketUrl: string;
}

export function TicketReplyEmail({
  name,
  subject,
  messagePreview,
  ticketUrl,
}: TicketReplyEmailProps) {
  return (
    <EmailLayout previewText={`Resposta ao seu chamado: ${subject}`}>
      <Section>
        <EmailHeading as="h2">Resposta ao seu chamado</EmailHeading>

        <EmailText>
          Olá, {name}! Sua solicitação sobre &quot;{subject}&quot; recebeu uma
          resposta.
        </EmailText>
      </Section>

      <Section
        style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '16px',
          margin: '16px 0',
        }}
      >
        <EmailText style={{ margin: 0 }}>{messagePreview}</EmailText>
      </Section>

      <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <EmailButton href={ticketUrl}>Ver chamado completo</EmailButton>
      </Section>
    </EmailLayout>
  );
}

export async function getTicketReplyEmailTemplate(
  data: TicketReplyEmailProps,
) {
  const emailComponent = <TicketReplyEmail {...data} />;

  return {
    subject: `Resposta ao seu chamado: ${data.subject}`,
    html: await render(emailComponent),
    text: await render(emailComponent, { plainText: true }),
  };
}

export default TicketReplyEmail;
