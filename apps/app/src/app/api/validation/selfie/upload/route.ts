import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAdminClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Magic bytes (assinaturas de arquivo) para validação de tipo real
 */
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [
    [0xff, 0xd8, 0xff, 0xe0], // JPEG JFIF
    [0xff, 0xd8, 0xff, 0xe1], // JPEG EXIF
    [0xff, 0xd8, 0xff, 0xe2], // JPEG ICC
    [0xff, 0xd8, 0xff, 0xe8], // JPEG SPIFF
    [0xff, 0xd8, 0xff, 0xdb], // JPEG RAW
  ],
  'image/png': [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // "RIFF"
  ],
};

/**
 * Verifica se os magic bytes do arquivo correspondem ao MIME type declarado
 */
function validateFileMagicBytes(
  buffer: Buffer,
  declaredMimeType: string
): boolean {
  const signatures = FILE_SIGNATURES[declaredMimeType];
  if (!signatures) {
    return false;
  }

  for (const signature of signatures) {
    let matches = true;
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      // Para WebP, verificar também se contém "WEBP" na posição 8
      if (declaredMimeType === 'image/webp') {
        const webpSignature = [0x57, 0x45, 0x42, 0x50]; // "WEBP"
        for (let i = 0; i < webpSignature.length; i++) {
          if (buffer[8 + i] !== webpSignature[i]) {
            return false;
          }
        }
      }
      return true;
    }
  }

  return false;
}

/**
 * POST /api/validation/selfie/upload - Upload de selfie para validação de prova de vida
 * Aceita apenas o campo 'selfie'
 */
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json(
        { error: 'Apenas babás podem fazer upload de selfie' },
        { status: 403 }
      );
    }

    const nannyId = currentUser.nanny.id;

    const formData = await req.formData();
    const selfie = formData.get('selfie') as File | null;

    if (!selfie) {
      return NextResponse.json(
        { error: 'Selfie é obrigatória' },
        { status: 400 }
      );
    }

    // Validar MIME type
    if (!ALLOWED_MIME_TYPES.includes(selfie.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use JPG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    // Validar tamanho
    if (selfie.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB.' },
        { status: 400 }
      );
    }

    // Validar magic bytes
    const arrayBuffer = await selfie.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!validateFileMagicBytes(buffer, selfie.type)) {
      return NextResponse.json(
        {
          error:
            'Arquivo inválido. O conteúdo não corresponde ao tipo de imagem declarado.',
        },
        { status: 400 }
      );
    }

    // Upload para Supabase
    const adminSupabase = createAdminClient();
    const fileExt = selfie.name.split('.').pop() || 'jpg';
    const fileName = `${nannyId}/selfie_${uuidv4()}.${fileExt}`;

    const { data, error } = await adminSupabase.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: selfie.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Erro ao fazer upload de selfie:', error);
      return NextResponse.json(
        { error: `Erro ao fazer upload: ${error.message}` },
        { status: 500 }
      );
    }

    // Remover upload anterior do tipo SELFIE
    const existingUpload = await prisma.documentUpload.findFirst({
      where: {
        nannyId,
        type: 'SELFIE',
      },
    });

    if (existingUpload) {
      await adminSupabase.storage.from('documents').remove([existingUpload.url]);
      await prisma.documentUpload.delete({
        where: { id: existingUpload.id },
      });
    }

    // Salvar novo upload no banco
    await prisma.documentUpload.create({
      data: {
        nannyId,
        type: 'SELFIE',
        url: data.path,
      },
    });

    // Retornar URL assinada para preview
    const { data: signedData } = await adminSupabase.storage
      .from('documents')
      .createSignedUrl(data.path, 3600);

    return NextResponse.json({
      success: true,
      upload: {
        type: 'SELFIE',
        url: data.path,
      },
      signedUrl: signedData?.signedUrl || null,
      message: 'Selfie enviada com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao fazer upload de selfie:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/validation/selfie/upload - Retorna a selfie enviada
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json(
        { error: 'Apenas babás podem acessar uploads de selfie' },
        { status: 403 }
      );
    }

    const nannyId = currentUser.nanny.id;

    const upload = await prisma.documentUpload.findFirst({
      where: {
        nannyId,
        type: 'SELFIE',
      },
      select: {
        id: true,
        type: true,
        url: true,
        createdAt: true,
      },
    });

    if (!upload) {
      return NextResponse.json({ upload: null });
    }

    // Gerar URL assinada
    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase.storage
      .from('documents')
      .createSignedUrl(upload.url, 3600);

    return NextResponse.json({
      upload: {
        ...upload,
        signedUrl: data?.signedUrl || null,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar selfie:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
