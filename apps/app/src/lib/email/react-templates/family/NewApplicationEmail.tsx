import { Section } from '@react-email/components';
import { render } from '@react-email/render';
import { EmailLayout } from '../components/EmailLayout';
import { EmailButton } from '../components/EmailButton';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailDetailsBox } from '../components/EmailDetailsBox';
import { EmailInfoBox } from '../components/EmailInfoBox';

export interface NewApplicationEmailProps {
  name: string; // Primeiro nome da família
  nannyName: string; // Primeiro nome da babá
  nannyPhotoUrl: string | null; // Foto da babá (não usado por enquanto)
  jobTitle: string; // Título da vaga
  experienceYears: number; // Anos de experiência
  neighborhood: string; // Bairro da babá
  city: string; // Cidade da babá
  seals: string[]; // Selos da babá (Identificada, Verificada, etc)
  presentationMessage: string; // Mensagem de apresentação (max 200 chars)
  viewApplicationUrl: string; // Link para ver a candidatura
}

export function NewApplicationEmail({
  name,
  nannyName,
  jobTitle,
  experienceYears,
  neighborhood,
  city,
  seals,
  presentationMessage,
  viewApplicationUrl,
}: NewApplicationEmailProps) {
  return (
    <EmailLayout previewText={`${nannyName} se candidatou à sua vaga`}>
      <Section>
        <EmailHeading as="h2">📩 Nova candidatura!</EmailHeading>

        <EmailText>
          Olá, {name}! <strong>{nannyName}</strong> se candidatou à sua vaga{' '}
          <strong>"{jobTitle}"</strong>.
        </EmailText>
      </Section>

      <EmailDetailsBox
        title="Sobre a babá"
        titleIcon="👤"
        variant="default"
        items={[
          { label: 'Nome', value: nannyName },
          {
            label: 'Localização',
            value: `${neighborhood}, ${city}`,
          },
          {
            label: 'Experiência',
            value:
              experienceYears > 0
                ? `${experienceYears} ano${experienceYears > 1 ? 's' : ''}`
                : 'Iniciante',
          },
          {
            label: 'Selos',
            value: seals.length > 0 ? seals.join(', ') : 'Sem selos',
          },
        ]}
      />

      {presentationMessage && (
        <Section>
          <EmailText>
            <strong>💬 Mensagem de apresentação:</strong>
          </EmailText>
          <EmailText muted>{presentationMessage}</EmailText>
        </Section>
      )}

      <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <EmailButton href={viewApplicationUrl}>Ver candidatura</EmailButton>
      </Section>

      <EmailInfoBox variant="default">
        💡 Dica: Responda rápido para não perder a oportunidade!
      </EmailInfoBox>
    </EmailLayout>
  );
}

export async function getNewApplicationEmailTemplate(
  data: NewApplicationEmailProps,
) {
  const emailComponent = <NewApplicationEmail {...data} />;

  return {
    subject: `📩 ${data.nannyName} se candidatou à sua vaga!`,
    html: await render(emailComponent),
    text: await render(emailComponent, { plainText: true }),
  };
}

export default NewApplicationEmail;
