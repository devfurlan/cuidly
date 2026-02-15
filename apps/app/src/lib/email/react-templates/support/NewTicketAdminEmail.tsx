import { Section } from '@react-email/components';
import { render } from '@react-email/render';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailDetailsBox } from '../components/EmailDetailsBox';
import { EmailButton } from '../components/EmailButton';

interface NewTicketAdminEmailProps {
  userName: string;
  userType: 'Babá' | 'Família';
  userEmail: string;
  subject: string;
  category: string;
  messagePreview: string;
  ticketUrl: string;
}

export function NewTicketAdminEmail({
  userName,
  userType,
  userEmail,
  subject,
  category,
  messagePreview,
  ticketUrl,
}: NewTicketAdminEmailProps) {
  return (
    <EmailLayout previewText={`Novo chamado de suporte: ${subject}`}>
      <Section>
        <EmailHeading as="h2">Novo chamado de suporte</EmailHeading>

        <EmailText>
          Um novo chamado foi aberto por <strong>{userName}</strong> ({userType}).
        </EmailText>
      </Section>

      <EmailDetailsBox
        title="Detalhes do chamado"
        titleIcon="📋"
        variant="default"
        items={[
          { label: 'Usuário', value: `${userName} (${userType})` },
          { label: 'E-mail', value: userEmail },
          { label: 'Categoria', value: category },
          { label: 'Assunto', value: subject },
        ]}
      />

      <Section>
        <EmailText>
          <strong>Mensagem:</strong>
        </EmailText>
        <EmailText>{messagePreview}</EmailText>
      </Section>

      <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <EmailButton href={ticketUrl}>Ver chamado no admin</EmailButton>
      </Section>
    </EmailLayout>
  );
}

export async function getNewTicketAdminEmailTemplate(
  data: NewTicketAdminEmailProps,
) {
  const emailComponent = <NewTicketAdminEmail {...data} />;

  return {
    subject: `Novo chamado: ${data.subject}`,
    html: await render(emailComponent),
    text: await render(emailComponent, { plainText: true }),
  };
}

export default NewTicketAdminEmail;
