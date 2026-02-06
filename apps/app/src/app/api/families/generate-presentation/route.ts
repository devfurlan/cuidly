import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';
import { isSafeText } from '@/services/content-moderation';
import {
  FAMILY_NANNY_TYPE_OPTIONS,
  FAMILY_CONTRACT_REGIME_OPTIONS,
  DOMESTIC_HELP_OPTIONS,
  PET_TYPES_OPTIONS,
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
      // Responsável
      responsibleName,
      gender,
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
    } = body;

    // Build context for the AI
    const contextParts: string[] = [];

    // Responsible info
    if (responsibleName) {
      const firstName = responsibleName.split(' ')[0];
      contextParts.push(`Nome: ${firstName}`);
    }

    // Children info
    if (children?.length) {
      const childrenInfo = children.map((child: { name?: string; birthDate?: string; gender?: string }) => {
        const parts: string[] = [];
        if (child.name) parts.push(child.name);
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
        return parts.join(', ');
      });
      contextParts.push(`Filhos: ${childrenInfo.join('; ')}`);
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
        MONDAY: 'Seg', TUESDAY: 'Ter', WEDNESDAY: 'Qua',
        THURSDAY: 'Qui', FRIDAY: 'Sex', SATURDAY: 'Sáb', SUNDAY: 'Dom',
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
      contextParts.push(`Disponibilidade: ${availParts.join('; ')}`);
    }

    // Nanny type
    if (nannyType) {
      contextParts.push(`Tipo de babá: ${getLabel(FAMILY_NANNY_TYPE_OPTIONS, nannyType)}`);
    }

    // Contract regime
    if (contractRegime) {
      contextParts.push(`Regime: ${getLabel(FAMILY_CONTRACT_REGIME_OPTIONS, contractRegime)}`);
    }

    // Domestic help
    if (domesticHelp?.length) {
      const helps = getLabels(DOMESTIC_HELP_OPTIONS, domesticHelp);
      contextParts.push(`Atividades esperadas: ${helps.join(', ')}`);
    }

    // Pets
    if (hasPets === 'true' && petTypes?.length) {
      const pets = getLabels(PET_TYPES_OPTIONS, petTypes);
      contextParts.push(`Pets: ${pets.join(', ')}`);
    }

    const context = contextParts.join('\n');

    const systemPrompt = `Você é um especialista em criar apresentações acolhedoras para famílias que buscam babás.
Crie uma apresentação curta (entre 60-100 palavras) em primeira pessoa para o perfil da família.
A apresentação deve ser:
- Acolhedora e simpática
- Focada no bem-estar das crianças
- Transmitir um ambiente familiar agradável
- NÃO inventar informações que não foram fornecidas
- NÃO mencionar valores ou salários
- NUNCA incluir dados de contato (telefone, email, WhatsApp, Instagram, redes sociais, URLs, endereço completo)
- Escrever de forma natural, como se a família estivesse se apresentando para uma potencial babá`;

    const userPrompt = `Crie uma apresentação acolhedora baseada nas seguintes informações da família:\n\n${context}\n\nEscreva apenas a apresentação, sem títulos ou explicações.`;

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
        max_tokens: 250,
      });

      text = completion.choices[0]?.message?.content?.trim() || '';

      // Validate that text doesn't contain contact info
      const validation = isSafeText(text);
      if (validation.safe) {
        break;
      }

      console.warn(`Presentation generation attempt ${attempt} contained contact info:`, validation.reason);

      if (attempt === MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Não foi possível gerar uma apresentação válida. Tente novamente.' },
          { status: 422 }
        );
      }
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error generating family presentation:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar apresentação' },
      { status: 500 }
    );
  }
}
