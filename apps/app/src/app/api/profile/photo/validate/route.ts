import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { validateProfilePhoto, getValidationSummary } from '@/lib/photo-validation';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { photoDataUrl } = body;

    if (!photoDataUrl) {
      return NextResponse.json(
        { error: 'Foto não fornecida' },
        { status: 400 },
      );
    }

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    // Validate the photo
    const validationResult = await validateProfilePhoto(photoDataUrl, openai);
    const summary = getValidationSummary(validationResult);

    return NextResponse.json({
      ...validationResult,
      summary,
    });
  } catch (error) {
    console.error('Error validating photo:', error);
    return NextResponse.json(
      { error: 'Erro ao validar foto' },
      { status: 500 },
    );
  }
}
