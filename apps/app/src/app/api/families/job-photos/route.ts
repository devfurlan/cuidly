import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * POST /api/families/job-photos - Upload a job photo
 * Returns the public URL of the uploaded photo
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json({ error: 'Usuário não é uma família' }, { status: 400 });
    }

    const familyId = currentUser.family.id;
    const body = await request.json();
    const { photoDataUrl } = body;

    if (!photoDataUrl) {
      return NextResponse.json({ error: 'Foto não enviada' }, { status: 400 });
    }

    // Parse data URL: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...
    const matches = photoDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: 'Formato de imagem inválido' }, { status: 400 });
    }

    const mimeType = matches[1];
    const fileBuffer = Buffer.from(matches[2], 'base64');

    // Validate file type
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename - use profile-photos bucket with job-photos subfolder
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
    const filename = `families/${familyId}/job-photos/${timestamp}-${randomString}.${extension}`;

    // Use admin client to bypass RLS policies
    const adminClient = createAdminClient();

    // Upload to Supabase Storage (using profile-photos bucket)
    const { data, error } = await adminClient.storage
      .from('profile-photos')
      .upload(filename, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', error.message, error);
      // Traduzir mensagens de erro comuns do Supabase
      let errorMessage = 'Erro ao fazer upload da foto';
      if (error.message.includes('row-level security policy')) {
        errorMessage = 'Sem permissão para fazer upload. Verifique se você está autenticado.';
      } else if (error.message.includes('duplicate')) {
        errorMessage = 'Esta foto já foi enviada anteriormente.';
      } else if (error.message.includes('size')) {
        errorMessage = 'Arquivo muito grande.';
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('profile-photos')
      .getPublicUrl(data.path);

    return NextResponse.json({
      url: publicUrl,
      path: data.path,
    });
  } catch (error) {
    console.error('Error in job photo upload:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * DELETE /api/families/job-photos - Delete a job photo
 * Expects { url: string } in body
 */
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json({ error: 'Usuário não é uma família' }, { status: 400 });
    }

    const familyId = currentUser.family.id;
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL não fornecida' }, { status: 400 });
    }

    // Extract path from URL (using profile-photos bucket)
    const path = url.split('/profile-photos/').pop();
    if (!path) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }

    // Verify the photo belongs to this family's job-photos folder
    if (!path.startsWith(`families/${familyId}/job-photos/`)) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 });
    }

    // Use admin client to bypass RLS policies
    const adminClient = createAdminClient();

    // Delete from storage
    const { error } = await adminClient.storage
      .from('profile-photos')
      .remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      return NextResponse.json(
        { error: 'Erro ao remover arquivo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in job photo delete:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
