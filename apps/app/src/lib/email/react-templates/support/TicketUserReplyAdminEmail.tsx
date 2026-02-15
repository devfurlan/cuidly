import { Section } from '@react-email/components';
import { render } from '@react-email/render';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';

interface TicketUserReplyAdminEmailProps {
  userName: string;
  userType: 'Babá' | 'Família';
  subject: string;
  messagePreview: string;
  ticketUrl: string;
}

export function TicketUserReplyAdminEmail({
  userName,
  userType,
  subject,
  messagePreview,
  ticketUrl,
}: TicketUserReplyAdminEmailProps) {
  return (
    <EmailLayout
      previewText={`Nova resposta de ${userName} no chamado: ${subject}`}
    >
      <Section>
        <EmailHeading as="h2">Nova resposta no chamado</EmailHeading>

        <EmailText>
          <strong>{userName}</strong> ({userType}) respondeu ao chamado &quot;
          {subject}&quot;.
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
        <EmailButton href={ticketUrl}>Ver chamado no admin</EmailButton>
      </Section>
    </EmailLayout>
  );
}

export async function getTicketUserReplyAdminEmailTemplate(
  data: TicketUserReplyAdminEmailProps,
) {
  const emailComponent = <TicketUserReplyAdminEmail {...data} />;

  return {
    subject: `Nova resposta no chamado: ${data.subject}`,
    html: await render(emailComponent),
    text: await render(emailComponent, { plainText: true }),
  };
}

export default TicketUserReplyAdminEmail;
