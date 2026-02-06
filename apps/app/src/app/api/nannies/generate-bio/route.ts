import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import OpenAI from 'openai';
import { isSafeText } from '@/services/content-moderation';
import {
  STRENGTH_OPTIONS,
  CHILD_AGE_EXPERIENCE_OPTIONS,
  ACCEPTED_ACTIVITIES_OPTIONS,
  ACTIVITIES_NOT_ACCEPTED_OPTIONS,
  HOURLY_RATE_OPTIONS,
  MAX_CHILDREN_CARE_OPTIONS,
  COMFORT_WITH_PETS_OPTIONS,
  NANNY_TYPE_OPTIONS,
  CONTRACT_REGIME_OPTIONS,
} from '@/constants/options/nanny-options';
import { getExperienceYearsLabel } from '@/helpers/label-getters';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function getLabel(options: readonly { value: string | number; label: string }[], value: string | number): string {
  return options.find(o => String(o.value) === String(value))?.label || String(value);
}

function getLabels(options: readonly { value: string | number; label: string }[], values: (string | number)[]): string[] {
  return values.map(v => getLabel(options, v));
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only nannies can generate bios
    if (currentUser.type !== 'nanny') {
      return NextResponse.json(
        { error: 'Apenas babás podem gerar biografias' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      // Gênero para linguagem correta
      gender,
      // Tipo de trabalho e contratação
      nannyType,
      contractRegime,
      // Experiência
      experienceYears,
      childAgeExperiences,
      maxChildrenCare,
      // Preferências
      hasCnh,
      isSmoker,
      comfortableWithPets,
      // Pontos fortes e atividades
      strengths,
      acceptedActivities,
      activitiesNotAccepted,
      // Disponibilidade e valor
      availability,
      hourlyRateRange,
    } = body;

    // Build context for the AI
    const contextParts: string[] = [];

    // Nanny type (Folguista/Diarista/Mensalista)
    if (nannyType?.length) {
      const types = getLabels(NANNY_TYPE_OPTIONS, nannyType);
      contextParts.push(`Tipo de trabalho: ${types.join(', ')}`);
    }

    // Contract regime (Autônoma/PJ/CLT)
    if (contractRegime?.length) {
      const regimes = getLabels(CONTRACT_REGIME_OPTIONS, contractRegime);
      contextParts.push(`Regime de contratação: ${regimes.join(', ')}`);
    }

    // Experience
    if (experienceYears !== undefined) {
      contextParts.push(`Experiência: ${getExperienceYearsLabel(experienceYears)}`);
    }

    // Age ranges
    if (childAgeExperiences?.length) {
      const ages = getLabels(CHILD_AGE_EXPERIENCE_OPTIONS, childAgeExperiences);
      contextParts.push(`Faixas etárias: ${ages.join(', ')}`);
    }

    // Max children
    if (maxChildrenCare) {
      contextParts.push(`Máximo de crianças: ${getLabel(MAX_CHILDREN_CARE_OPTIONS, String(maxChildrenCare))}`);
    }

    // CNH
    if (hasCnh === true || hasCnh === 'true') {
      contextParts.push('Possui CNH (carteira de motorista)');
    }

    // Non-smoker (only mention if not a smoker, as it's a positive trait)
    if (isSmoker === false || isSmoker === 'false') {
      contextParts.push('Não fumante');
    }

    // Pets
    if (comfortableWithPets) {
      contextParts.push(`Animais de estimação: ${getLabel(COMFORT_WITH_PETS_OPTIONS, comfortableWithPets)}`);
    }

    // Strengths
    if (strengths?.length) {
      const strs = getLabels(STRENGTH_OPTIONS, strengths);
      contextParts.push(`Pontos fortes: ${strs.join(', ')}`);
    }

    // Activities
    if (acceptedActivities?.length) {
      const acts = getLabels(ACCEPTED_ACTIVITIES_OPTIONS, acceptedActivities);
      contextParts.push(`Atividades que realiza: ${acts.join(', ')}`);
    }

    // Activities NOT accepted
    if (activitiesNotAccepted?.length) {
      const notActs = getLabels(ACTIVITIES_NOT_ACCEPTED_OPTIONS, activitiesNotAccepted);
      contextParts.push(`Não realiza: ${notActs.join(', ')}`);
    }

    // Availability summary
    if (availability) {
      const dayNames: Record<string, string> = {
        monday: 'Seg',
        tuesday: 'Ter',
        wednesday: 'Qua',
        thursday: 'Qui',
        friday: 'Sex',
        saturday: 'Sáb',
        sunday: 'Dom',
      };
      const periodNames: Record<string, string> = {
        MORNING: 'Manhã',
        AFTERNOON: 'Tarde',
        NIGHT: 'Noite',
        OVERNIGHT: 'Pernoite',
      };
      const availableDays: string[] = [];
      for (const [day, periods] of Object.entries(availability)) {
        const p = periods as string[];
        if (p?.length) {
          const periodLabels = p.map(period => periodNames[period] || period);
          availableDays.push(`${dayNames[day]}: ${periodLabels.join(', ')}`);
        }
      }
      if (availableDays.length) {
        contextParts.push(`Disponibilidade: ${availableDays.join('; ')}`);
      }
    }

    // Hourly rate range
    if (hourlyRateRange) {
      contextParts.push(`Valor por hora: ${getLabel(HOURLY_RATE_OPTIONS, hourlyRateRange)}`);
    }

    const context = contextParts.join('\n');

    // Determine gender-appropriate terms
    const isMale = gender === 'MALE';
    const profissionalTerm = isMale ? 'babá/cuidador infantil' : 'babá/cuidadora infantil';
    const profissionalTermSEO = isMale
      ? '"babá", "cuidador infantil", "cuidador de crianças"'
      : '"babá", "cuidadora infantil", "cuidadora de crianças"';
    const palavrasChave = isMale
      ? 'babá profissional, cuidador de crianças, experiência com crianças'
      : 'babá profissional, cuidadora de crianças, experiência com crianças';
    const comoSeApresentando = isMale ? 'como se o profissional estivesse se apresentando' : 'como se a profissional estivesse se apresentando';

    const systemPrompt = `Você é um especialista em criar biografias profissionais para ${profissionalTerm}.
Crie uma bio curta (entre 80-120 palavras) em primeira pessoa para o perfil.
A bio deve ser:
- Profissional mas acolhedora
- Destacar os principais diferenciais
- Focada em SEO para buscas de ${profissionalTermSEO}
- Usar palavras-chave naturalmente como: ${palavrasChave}
- Transmitir confiança e carinho
- NÃO inventar informações que não foram fornecidas
- NÃO mencionar valores ou salários
- NUNCA incluir dados de contato (telefone, email, WhatsApp, Instagram, redes sociais, URLs)
- Escrever de forma natural, ${comoSeApresentando}
- IMPORTANTE: Usar linguagem ${isMale ? 'no masculino (ex: "Sou um babá profissional", "dedicado", "comprometido")' : 'no feminino (ex: "Sou uma babá profissional", "dedicada", "comprometida")'}`;

    const userPrompt = `Crie uma bio profissional baseada nas seguintes informações ${isMale ? 'do profissional' : 'da profissional'}:\n\n${context}\n\nEscreva apenas a bio, sem títulos ou explicações.`;

    // Try up to 3 times to generate a bio without contact info
    const MAX_ATTEMPTS = 3;
    let bio = '';

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      bio = completion.choices[0]?.message?.content?.trim() || '';

      // Validate that bio doesn't contain contact info
      const validation = isSafeText(bio);
      if (validation.safe) {
        break;
      }

      console.warn(`Bio generation attempt ${attempt} contained contact info:`, validation.reason);

      if (attempt === MAX_ATTEMPTS) {
        // Last attempt still has contact info, return error
        return NextResponse.json(
          { error: 'Não foi possível gerar uma bio válida. Tente novamente.' },
          { status: 422 }
        );
      }
    }

    return NextResponse.json({ bio });
  } catch (error) {
    console.error('Error generating bio:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar bio' },
      { status: 500 }
    );
  }
}
