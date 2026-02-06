import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAdminClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { DocumentUploadType } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (PDFs podem ser maiores)

/**
 * Magic bytes (assinaturas de arquivo) para validação de tipo real
 * Isso previne que arquivos maliciosos sejam enviados com extensão errada
 */
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF, 0xE0], // JPEG JFIF
    [0xFF, 0xD8, 0xFF, 0xE1], // JPEG EXIF
    [0xFF, 0xD8, 0xFF, 0xE2], // JPEG ICC
    [0xFF, 0xD8, 0xFF, 0xE8], // JPEG SPIFF
    [0xFF, 0xD8, 0xFF, 0xDB], // JPEG RAW
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
  ],
  'image/webp': [
    // WebP começa com "RIFF" seguido de tamanho e "WEBP"
    [0x52, 0x49, 0x46, 0x46], // "RIFF" - verificamos só o início
  ],
  'application/pdf': [
    [0x25, 0x50, 0x44, 0x46], // "%PDF"
  ],
};

/**
 * Verifica se os magic bytes do arquivo correspondem ao MIME type declarado
 */
function validateFileMagicBytes(buffer: Buffer, declaredMimeType: string): boolean {
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
 * POST /api/validation/upload - Upload de documentos para validação
 * Aceita: documentFront, documentBack, selfie
 */
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({ error: 'Apenas babas podem fazer upload de documentos' }, { status: 403 });
    }

    const nannyId = currentUser.nanny.id;

    const formData = await req.formData();
    const documentFront = formData.get('documentFront') as File | null;
    const documentBack = formData.get('documentBack') as File | null;
    const selfie = formData.get('selfie') as File | null;

    if (!documentFront) {
      return NextResponse.json(
        { error: 'Documento (frente) e obrigatorio' },
        { status: 400 }
      );
    }

    // Validar arquivos
    const filesToUpload: { file: File; type: DocumentUploadType }[] = [
      { file: documentFront, type: 'DOCUMENT_FRONT' },
    ];

    if (selfie) {
      filesToUpload.push({ file: selfie, type: 'SELFIE' });
    }

    if (documentBack) {
      filesToUpload.push({ file: documentBack, type: 'DOCUMENT_BACK' });
    }

    // Validar MIME type e tamanho primeiro
    for (const { file, type } of filesToUpload) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Tipo de arquivo invalido para ${type}. Use JPG, PNG, WebP ou PDF.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Arquivo ${type} muito grande. Máximo 10MB.` },
          { status: 400 }
        );
      }
    }

    // Validar magic bytes (assinatura real do arquivo) para prevenir upload de arquivos maliciosos
    for (const { file, type } of filesToUpload) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (!validateFileMagicBytes(buffer, file.type)) {
        return NextResponse.json(
          { error: `Arquivo ${type} inválido. O conteúdo não corresponde ao tipo de imagem declarado.` },
          { status: 400 }
        );
      }
    }

    // Usar admin client para upload
    const adminSupabase = createAdminClient();
    const uploadResults: { type: DocumentUploadType; url: string }[] = [];

    for (const { file, type } of filesToUpload) {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${nannyId}/${type.toLowerCase()}_${uuidv4()}.${fileExt}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data, error } = await adminSupabase.storage
        .from('documents')
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error(`Erro ao fazer upload de ${type}:`, error);
        return NextResponse.json(
          { error: `Erro ao fazer upload de ${type}: ${error.message}` },
          { status: 500 }
        );
      }

      uploadResults.push({
        type,
        url: data.path,
      });
    }

    // Remover uploads anteriores do mesmo tipo
    const existingUploads = await prisma.documentUpload.findMany({
      where: {
        nannyId,
        type: { in: uploadResults.map((r) => r.type) },
      },
    });

    // Deletar arquivos antigos do storage
    if (existingUploads.length > 0) {
      const pathsToDelete = existingUploads.map((u) => u.url);
      await adminSupabase.storage.from('documents').remove(pathsToDelete);

      await prisma.documentUpload.deleteMany({
        where: { id: { in: existingUploads.map((u) => u.id) } },
      });
    }

    // Salvar novos uploads no banco
    await prisma.documentUpload.createMany({
      data: uploadResults.map((result) => ({
        nannyId,
        type: result.type,
        url: result.url,
      })),
    });

    // Retornar URLs assinadas para preview
    const signedUrls: Record<string, string> = {};
    for (const result of uploadResults) {
      const { data: signedData } = await adminSupabase.storage
        .from('documents')
        .createSignedUrl(result.url, 3600); // 1 hora

      if (signedData?.signedUrl) {
        signedUrls[result.type] = signedData.signedUrl;
      }
    }

    return NextResponse.json({
      success: true,
      uploads: uploadResults,
      signedUrls,
      message: 'Documentos enviados com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * GET /api/validation/upload - Retorna os documentos enviados
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({ error: 'Apenas babas podem acessar uploads de documentos' }, { status: 403 });
    }

    const nannyId = currentUser.nanny.id;

    const uploads = await prisma.documentUpload.findMany({
      where: { nannyId },
      select: {
        id: true,
        type: true,
        url: true,
        createdAt: true,
      },
    });

    // Gerar URLs assinadas
    const adminSupabase = createAdminClient();
    const uploadsWithUrls = await Promise.all(
      uploads.map(async (upload) => {
        const { data } = await adminSupabase.storage
          .from('documents')
          .createSignedUrl(upload.url, 3600);

        return {
          ...upload,
          signedUrl: data?.signedUrl || null,
        };
      })
    );

    return NextResponse.json({ uploads: uploadsWithUrls });
  } catch (error) {
    console.error('Erro ao buscar uploads:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
