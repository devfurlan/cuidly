import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';
import { isSafeText } from '@/services/content-moderation';
import {
  FAMILY_NANNY_TYPE_OPTIONS,
  FAMILY_CONTRACT_REGIME_OPTIONS,
  DOMESTIC_HELP_OPTIONS,
  PET_TYPES_OPTIONS,
  FAMILY_HOURLY_RATE_OPTIONS,
} from '@/constants/options/family-options';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function getLabel(options: readonly { value: string; label: string }[], value: string): string {
  return options.find(o => o.value === value)?.label || value;
}

function getLabels(options: readonly { value: string; label: string }[], values: string[]): string[] {
  return values.map(v => getLabel(options, v));
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      // Filhos
      children,
      // Endereço
      address,
      // Disponibilidade
      availability,
      // Preferências
      nannyType,
      contractRegime,
      domesticHelp,
      hasPets,
      petTypes,
      mandatoryRequirements,
      hourlyRateRange,
    } = body;

    // Build context for the AI
    const contextParts: string[] = [];

    // Children info
    if (children?.length) {
      const childrenInfo = children.map((child: { name?: string; birthDate?: string; gender?: string; specialNeeds?: boolean; specialNeedsDescription?: string }) => {
        const parts: string[] = [];
        if (child.birthDate) {
          // Calculate age from birthDate (DD/MM/YYYY)
          const [day, month, year] = child.birthDate.split('/').map(Number);
          const birthDate = new Date(year, month - 1, day);
          const now = new Date();
          let age = now.getFullYear() - birthDate.getFullYear();
          const monthDiff = now.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
            age--;
          }
          if (age < 1) {
            const months = Math.max(0, (now.getFullYear() - birthDate.getFullYear()) * 12 + now.getMonth() - birthDate.getMonth());
            parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
          } else {
            parts.push(`${age} ${age === 1 ? 'ano' : 'anos'}`);
          }
        }
        if (child.gender) {
          parts.push(child.gender === 'MALE' ? 'menino' : 'menina');
        }
        if (child.specialNeeds && child.specialNeedsDescription) {
          parts.push(`necessidades especiais: ${child.specialNeedsDescription}`);
        }
        return parts.join(', ');
      });
      contextParts.push(`Crianças: ${childrenInfo.join('; ')}`);
      contextParts.push(`Número de crianças: ${children.length}`);
    }

    // Location (only city/neighborhood for privacy)
    if (address?.city) {
      const location = address.neighborhood
        ? `${address.neighborhood}, ${address.city}`
        : address.city;
      contextParts.push(`Localização: ${location}`);
    }

    // Availability
    if (availability?.slots?.length) {
      const dayNames: Record<string, string> = {
        MONDAY: 'Segunda', TUESDAY: 'Terça', WEDNESDAY: 'Quarta',
        THURSDAY: 'Quinta', FRIDAY: 'Sexta', SATURDAY: 'Sábado', SUNDAY: 'Domingo',
      };
      const shiftNames: Record<string, string> = {
        MORNING: 'Manhã', AFTERNOON: 'Tarde', NIGHT: 'Noite', OVERNIGHT: 'Pernoite',
      };

      // Group slots by day
      const slotsByDay: Record<string, string[]> = {};
      for (const slot of availability.slots) {
        const [day, shift] = slot.split('_');
        if (!slotsByDay[day]) slotsByDay[day] = [];
        slotsByDay[day].push(shiftNames[shift] || shift);
      }

      const availParts = Object.entries(slotsByDay).map(([day, shifts]) =>
        `${dayNames[day] || day}: ${shifts.join(', ')}`
      );
      contextParts.push(`Horários: ${availParts.join('; ')}`);
    }

    // Nanny type
    if (nannyType) {
      contextParts.push(`Tipo de vaga: ${getLabel(FAMILY_NANNY_TYPE_OPTIONS, nannyType)}`);
    }

    // Contract regime
    if (contractRegime) {
      contextParts.push(`Regime: ${getLabel(FAMILY_CONTRACT_REGIME_OPTIONS, contractRegime)}`);
    }

    // Domestic help
    if (domesticHelp?.length) {
      const helps = getLabels(DOMESTIC_HELP_OPTIONS, domesticHelp);
      contextParts.push(`Atividades: ${helps.join(', ')}`);
    }

    // Pets
    if (hasPets === 'true' && petTypes?.length) {
      const pets = getLabels(PET_TYPES_OPTIONS, petTypes);
      contextParts.push(`Pets em casa: ${pets.join(', ')}`);
    }

    // Mandatory requirements
    if (mandatoryRequirements?.length) {
      const reqs: string[] = [];
      if (mandatoryRequirements.includes('NON_SMOKER')) reqs.push('Não fumante');
      if (mandatoryRequirements.includes('DRIVER_LICENSE')) reqs.push('Com CNH');
      if (reqs.length) {
        contextParts.push(`Requisitos obrigatórios: ${reqs.join(', ')}`);
      }
    }

    // Hourly rate
    if (hourlyRateRange) {
      contextParts.push(`Valor: ${getLabel(FAMILY_HOURLY_RATE_OPTIONS, hourlyRateRange)}`);
    }

    const context = contextParts.join('\n');

    const systemPrompt = `Você é um especialista em criar descrições de vagas para babás e cuidadoras infantis.
Crie uma descrição de vaga clara e atrativa (entre 100-150 palavras).
A descrição deve:
- Começar descrevendo a oportunidade de forma atraente
- Detalhar as responsabilidades principais
- Mencionar os requisitos e diferenciais
- Transmitir um ambiente de trabalho agradável
- NÃO inventar informações que não foram fornecidas
- NÃO mencionar valores específicos de salário
- NUNCA incluir dados de contato (telefone, email, WhatsApp, Instagram, redes sociais, URLs, endereço completo)
- Usar um tom profissional mas acolhedor
- Usar SEO para buscas como "vaga de babá", "emprego de cuidadora"`;

    const userPrompt = `Crie uma descrição de vaga atrativa baseada nas seguintes informações:\n\n${context}\n\nEscreva apenas a descrição da vaga, sem títulos ou explicações.`;

    // Try up to 3 times to generate text without contact info
    const MAX_ATTEMPTS = 3;
    let text = '';

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 350,
      });

      text = completion.choices[0]?.message?.content?.trim() || '';

      // Validate that text doesn't contain contact info
      const validation = isSafeText(text);
      if (validation.safe) {
        break;
      }

      console.warn(`Job description generation attempt ${attempt} contained contact info:`, validation.reason);

      if (attempt === MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Não foi possível gerar uma descrição válida. Tente novamente.' },
          { status: 422 }
        );
      }
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error generating job description:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar descrição da vaga' },
      { status: 500 }
    );
  }
}
