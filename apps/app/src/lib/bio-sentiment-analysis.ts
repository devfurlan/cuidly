/**
 * Bio Sentiment Analysis Library
 *
 * Analyzes the sentiment and quality of caregiver biographies
 * using OpenAI and implements caching to reduce API costs
 */

import crypto from 'crypto';
import OpenAI from 'openai';
import { detectContactInformation } from '@/services/content-moderation';

// Type definitions
export interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  professionalism: number; // 0-10
  warmth: number; // 0-10
  confidence: number; // 0-10
  clarity: number; // 0-10
  concerns: string[];
  suggestions: string[];
  passesValidation: boolean;
}

export interface BioGenerationResult {
  bio: string;
  analysis: SentimentAnalysis;
  fromCache: boolean;
  cacheKey?: string;
}

// Red flags that should trigger warnings
const RED_FLAGS = [
  // Medical promises
  'curo',
  'garanto cura',
  'recuperação garantida',
  'tratamento médico',

  // Too informal
  'tipo assim',
  'né',
  'kkk',
  'rsrs',
  'haha',

  // Negative language
  'não tenho experiência',
  'sem experiência',
  'nunca fiz',
  'não sei',

  // Protected medical terms (without proper qualification)
  'diagnóstico',
  'prescrevo',
  'receito',
  'cirurgia',
];

// Validation thresholds
const VALIDATION_THRESHOLDS = {
  minProfessionalism: 7,
  minWarmth: 6,
  minConfidence: 6,
  minClarity: 7,
};

/**
 * Generate a cache key based on partner data
 * This ensures same input data generates same cache key
 */
export function generateCacheKey(data: any): string {
  // Create a normalized string of relevant fields
  const keyData = {
    name: data.name,
    experienceYears: data.experienceYears,
    city: data.address?.city,
    neighborhood: data.address?.neighborhood,
    specialties: Array.isArray(data.specialties) ? data.specialties.sort() : [],
    serviceTypes: Array.isArray(data.serviceTypes)
      ? data.serviceTypes.sort()
      : [],
    availabilitySchedules: Array.isArray(data.availabilitySchedules)
      ? data.availabilitySchedules.sort()
      : [],
    gender: data.gender,
    hasMei: data.hasMei,
    certificatesCount: data.certificatesCount || 0,
  };

  // Create hash from the data
  const dataString = JSON.stringify(keyData);
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

/**
 * Check for red flags in the biography text
 */
export function checkRedFlags(bio: string): string[] {
  const lowerBio = bio.toLowerCase();
  const found: string[] = [];

  for (const flag of RED_FLAGS) {
    if (lowerBio.includes(flag.toLowerCase())) {
      found.push(flag);
    }
  }

  // Check for contact information (phones, emails, etc.)
  const contactDetection = detectContactInformation(bio);
  if (contactDetection.hasContact) {
    found.push(...contactDetection.warnings);
  }

  return found;
}

/**
 * Analyze sentiment using OpenAI
 */
export async function analyzeSentiment(
  bio: string,
  openai: OpenAI,
): Promise<SentimentAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em análise de texto para biografias profissionais de babás e cuidadores infantis.

Analise a biografia fornecida e retorne um JSON com os seguintes campos:

{
  "sentiment": "positive" | "neutral" | "negative",
  "professionalism": 0-10 (quão profissional é o texto),
  "warmth": 0-10 (quão acolhedor e empático é o tom),
  "confidence": 0-10 (transmite confiança e credibilidade),
  "clarity": 0-10 (clareza e facilidade de entender),
  "concerns": ["array de preocupações encontradas"],
  "suggestions": ["array de sugestões de melhoria"]
}

Critérios de avaliação:

PROFISSIONALISMO (7-10 = bom):
- Uso adequado de termos técnicos
- Tom respeitoso e formal
- Sem gírias ou informalidades
- Estrutura gramatical correta

ACOLHIMENTO (6-10 = bom):
- Tom humano e empático
- Demonstra cuidado genuíno
- Não é frio ou distante
- Usa linguagem acessível

CONFIANÇA (6-10 = bom):
- Transmite credibilidade
- Menciona experiência/qualificações
- Linguagem assertiva (não hesitante)
- Sem promessas impossíveis

CLAREZA (7-10 = bom):
- Fácil de entender
- Bem estruturado
- Informações relevantes
- Não é prolixo ou confuso

CONCERNS: Liste problemas como:
- Promessas médicas não autorizadas
- Tom muito informal
- Linguagem negativa
- Termos técnicos inadequados
- Informações sensíveis expostas

SUGGESTIONS: Sugira melhorias se necessário.`,
        },
        {
          role: 'user',
          content: `Analise esta biografia:\n\n"${bio}"`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const analysis: SentimentAnalysis = JSON.parse(content);

    // Add red flags check
    const redFlags = checkRedFlags(bio);
    if (redFlags.length > 0) {
      analysis.concerns = [
        ...analysis.concerns,
        ...redFlags.map((flag) => `Termo inadequado detectado: "${flag}"`),
      ];
    }

    // Determine if passes validation
    analysis.passesValidation =
      analysis.sentiment !== 'negative' &&
      analysis.professionalism >= VALIDATION_THRESHOLDS.minProfessionalism &&
      analysis.warmth >= VALIDATION_THRESHOLDS.minWarmth &&
      analysis.confidence >= VALIDATION_THRESHOLDS.minConfidence &&
      analysis.clarity >= VALIDATION_THRESHOLDS.minClarity &&
      redFlags.length === 0;

    return analysis;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);

    // Return a default analysis on error
    return {
      sentiment: 'neutral',
      professionalism: 5,
      warmth: 5,
      confidence: 5,
      clarity: 5,
      concerns: ['Erro ao analisar sentimento'],
      suggestions: [],
      passesValidation: false,
    };
  }
}

/**
 * Improve biography based on analysis feedback
 */
export async function improveBioWithFeedback(
  originalBio: string,
  analysis: SentimentAnalysis,
  openai: OpenAI,
): Promise<string> {
  const feedbackPoints = [...analysis.concerns, ...analysis.suggestions];

  if (feedbackPoints.length === 0) {
    return originalBio;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em melhorar biografias profissionais de babás e cuidadores infantis.

Reescreva a biografia considerando os seguintes problemas e sugestões:
${feedbackPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

IMPORTANTE:
- Mantenha até 350 caracteres
- Use primeira pessoa
- Tom profissional e acolhedor
- Não inclua dados pessoais ou contatos
- Não faça promessas médicas
- Mantenha as informações factuais da biografia original`,
        },
        {
          role: 'user',
          content: `Biografia original:\n\n"${originalBio}"\n\nReescreva melhorando os pontos mencionados.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const improvedBio = response.choices[0]?.message?.content?.trim();
    return improvedBio || originalBio;
  } catch (error) {
    console.error('Error improving bio:', error);
    return originalBio;
  }
}

/**
 * Validate if analysis scores meet minimum thresholds
 */
export function meetsQualityThresholds(analysis: SentimentAnalysis): boolean {
  return analysis.passesValidation;
}

/**
 * Get user-friendly quality description
 */
export function getQualityDescription(score: number): {
  label: string;
  variant: 'success' | 'warning' | 'destructive';
} {
  if (score >= 8) {
    return { label: 'Excelente', variant: 'success' };
  } else if (score >= 7) {
    return { label: 'Bom', variant: 'success' };
  } else if (score >= 5) {
    return { label: 'Regular', variant: 'warning' };
  } else {
    return { label: 'Precisa melhorar', variant: 'destructive' };
  }
}
