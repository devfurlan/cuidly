/**
 * Photo Validation Library
 *
 * Uses OpenAI GPT-4 Vision to analyze profile photos
 * and detect issues like hats, sunglasses, hidden faces, etc.
 */

import OpenAI from 'openai';

export interface PhotoValidationResult {
  isValid: boolean;
  issues: PhotoIssue[];
  suggestions: string[];
  faceDetected: boolean;
  qualityScore: number; // 0-10
}

export interface PhotoIssue {
  type: PhotoIssueType;
  severity: 'warning' | 'error';
  message: string;
}

export type PhotoIssueType =
  | 'no_face'
  | 'face_partially_hidden'
  | 'sunglasses'
  | 'hat_or_cap'
  | 'mask'
  | 'low_quality'
  | 'poor_lighting'
  | 'multiple_faces'
  | 'inappropriate_content'
  | 'not_a_person'
  | 'rotated_image';

const ISSUE_MESSAGES: Record<PhotoIssueType, string> = {
  no_face: 'Não foi possível detectar um rosto na foto',
  face_partially_hidden: 'O rosto está parcialmente escondido',
  sunglasses: 'A foto contém óculos escuros - os olhos devem estar visíveis',
  hat_or_cap:
    'A foto contém boné ou chapéu - prefira uma foto sem acessórios na cabeça',
  mask: 'A foto contém máscara - o rosto deve estar completamente visível',
  low_quality: 'A qualidade da imagem está baixa',
  poor_lighting:
    'A iluminação da foto está ruim - prefira ambientes bem iluminados',
  multiple_faces: 'A foto contém mais de uma pessoa - use uma foto individual',
  inappropriate_content: 'A foto contém conteúdo inadequado',
  not_a_person: 'A foto não parece ser de uma pessoa',
  rotated_image: 'A foto está rotacionada ou de lado - ajuste a orientação',
};

/**
 * Validate a profile photo using GPT-4 Vision
 */
export async function validateProfilePhoto(
  imageBase64: string,
  openai: OpenAI,
): Promise<PhotoValidationResult> {
  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em análise de fotos de perfil para uma plataforma de babás e cuidadores infantis.

Analise a foto fornecida e retorne um JSON com os seguintes campos:

{
  "faceDetected": boolean (se há um rosto humano visível na foto),
  "qualityScore": number (0-10, qualidade geral da foto para perfil profissional),
  "issues": [
    {
      "type": string (tipo do problema),
      "severity": "warning" | "error" (gravidade)
    }
  ],
  "suggestions": ["array de sugestões de melhoria"]
}

TIPOS DE PROBLEMAS A DETECTAR:
- "no_face": Nenhum rosto humano detectado
- "face_partially_hidden": Rosto está parcialmente coberto (mão, cabelo cobrindo muito, etc.)
- "sunglasses": Pessoa usando óculos escuros
- "hat_or_cap": Pessoa usando boné, chapéu ou touca
- "mask": Pessoa usando máscara facial
- "low_quality": Imagem borrada, pixelada ou de baixa resolução
- "poor_lighting": Foto muito escura ou com iluminação ruim
- "multiple_faces": Mais de uma pessoa na foto
- "inappropriate_content": Conteúdo inadequado para perfil profissional
- "not_a_person": A imagem não é de uma pessoa (paisagem, objeto, animal, etc.)
- "rotated_image": A foto está rotacionada incorretamente (de lado, de cabeça para baixo, ou inclinada significativamente)

SEVERIDADE:
- "error": Problemas graves que impedem uso da foto (no_face, not_a_person, inappropriate_content, mask, sunglasses, rotated_image)
- "warning": Problemas que podem ser tolerados mas não são ideais (hat_or_cap, low_quality, poor_lighting, face_partially_hidden, multiple_faces)

CRITÉRIOS PARA QUALIDADE (qualityScore):
- 9-10: Foto profissional, rosto claro, boa iluminação, fundo neutro
- 7-8: Boa foto, rosto visível, iluminação adequada
- 5-6: Foto aceitável, alguns problemas menores
- 3-4: Foto com problemas significativos
- 0-2: Foto inadequada para perfil profissional

IMPORTANTE:
- Óculos de grau são permitidos (não confundir com óculos escuros)
- Maquiagem e brincos são permitidos
- A foto deve mostrar claramente o rosto da pessoa
- A foto deve transmitir profissionalismo e confiança`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analise esta foto de perfil e retorne o resultado em JSON:',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`,
                detail: 'low',
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(content);

    // Map the issues to include messages
    const issues: PhotoIssue[] = (analysis.issues || []).map(
      (issue: { type: PhotoIssueType; severity: 'warning' | 'error' }) => ({
        type: issue.type,
        severity: issue.severity,
        message:
          ISSUE_MESSAGES[issue.type] || `Problema detectado: ${issue.type}`,
      }),
    );

    // Determine if photo is valid (no errors)
    const hasErrors = issues.some((issue) => issue.severity === 'error');
    const isValid =
      analysis.faceDetected && !hasErrors && analysis.qualityScore >= 5;

    return {
      isValid,
      issues,
      suggestions: analysis.suggestions || [],
      faceDetected: analysis.faceDetected,
      qualityScore: analysis.qualityScore,
    };
  } catch (error) {
    console.error('Error validating photo:', error);

    // Return a default result on error (allow the photo but warn)
    return {
      isValid: true,
      issues: [],
      suggestions: [],
      faceDetected: true,
      qualityScore: 5,
    };
  }
}

/**
 * Get a user-friendly summary of the validation result
 */
export function getValidationSummary(result: PhotoValidationResult): {
  status: 'approved' | 'rejected';
  message: string;
} {
  if (!result.faceDetected) {
    return {
      status: 'rejected',
      message:
        'Não conseguimos identificar um rosto na foto. Escolha uma foto onde seu rosto esteja bem visível.',
    };
  }

  const errors = result.issues.filter((i) => i.severity === 'error');
  if (errors.length > 0) {
    return {
      status: 'rejected',
      message: errors[0].message,
    };
  }

  const warnings = result.issues.filter((i) => i.severity === 'warning');
  if (warnings.length > 0) {
    return {
      status: 'rejected',
      message: `${warnings[0].message}. Escolha outra foto para continuar.`,
    };
  }

  if (result.qualityScore < 5) {
    return {
      status: 'rejected',
      message:
        'A qualidade da foto está baixa. Escolha uma foto mais nítida e bem iluminada.',
    };
  }

  return {
    status: 'approved',
    message: 'Foto aprovada!',
  };
}
