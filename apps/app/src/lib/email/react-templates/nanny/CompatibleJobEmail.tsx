import { Section } from '@react-email/components';
import { render } from '@react-email/render';
import { EmailLayout } from '../components/EmailLayout';
import { EmailButton } from '../components/EmailButton';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailDetailsBox } from '../components/EmailDetailsBox';
import { EmailInfoBox } from '../components/EmailInfoBox';

export interface CompatibleJobEmailProps {
  name: string; // Primeiro nome da babá
  familyName: string; // "Família" apenas (privacidade)
  neighborhood: string; // Bairro da vaga
  city: string; // Cidade da vaga
  childrenCount: number; // Número de crianças
  childrenAges: string; // Idades (ex: "3 e 5 anos")
  jobType: string; // Tipo (Diarista, Mensalista, etc)
  schedule: string; // Horário resumido
  hourlyRate: string; // Faixa de valor
  viewJobUrl: string; // Link para ver a vaga
}

export function CompatibleJobEmail({
  name,
  neighborhood,
  city,
  childrenCount,
  childrenAges,
  jobType,
  schedule,
  hourlyRate,
  viewJobUrl,
}: CompatibleJobEmailProps) {
  return (
    <EmailLayout previewText="Nova vaga compatível com seu perfil">
      <Section>
        <EmailHeading as="h2">🎯 Nova vaga compatível!</EmailHeading>

        <EmailText>
          Olá, {name}! Encontramos uma oportunidade que combina com você.
        </EmailText>
      </Section>

      <EmailDetailsBox
        title="Detalhes da vaga"
        titleIcon="📋"
        variant="success"
        items={[
          {
            label: 'Localização',
            value: `${neighborhood}, ${city}`,
          },
          {
            label: 'Crianças',
            value:
              childrenCount > 0
                ? `${childrenCount} criança${childrenCount > 1 ? 's' : ''}${childrenAges ? ` (${childrenAges})` : ''}`
                : 'Não informado',
          },
          {
            label: 'Tipo',
            value: jobType,
          },
          {
            label: 'Horário',
            value: schedule,
          },
          {
            label: 'Valor',
            value: hourlyRate,
          },
        ]}
      />

      <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <EmailButton href={viewJobUrl}>Ver vaga e candidatar-se</EmailButton>
      </Section>

      <EmailInfoBox variant="default">
        💡 Candidate-se rápido! As vagas recebem muitas candidaturas.
      </EmailInfoBox>
    </EmailLayout>
  );
}

export async function getCompatibleJobEmailTemplate(
  data: CompatibleJobEmailProps,
) {
  const emailComponent = <CompatibleJobEmail {...data} />;

  return {
    subject: `🎯 Nova vaga em ${data.neighborhood}! Família procura babá`,
    html: await render(emailComponent),
    text: await render(emailComponent, { plainText: true }),
  };
}

export default CompatibleJobEmail;
