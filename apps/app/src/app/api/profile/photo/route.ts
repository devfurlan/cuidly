import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import prisma from '@/lib/prisma';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * POST /api/profile/photo - Upload or update profile photo
 * Accepts base64 data URL or file upload
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let fileBuffer: Buffer;
    let mimeType: string;

    if (contentType.includes('application/json')) {
      // Handle base64 data URL from crop dialog
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

      mimeType = matches[1];
      fileBuffer = Buffer.from(matches[2], 'base64');
    } else if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 });
      }

      mimeType = file.type;
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      return NextResponse.json({ error: 'Content-Type inválido' }, { status: 400 });
    }

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

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
    const folder = currentUser.type === 'nanny' ? 'nannies' : 'families';
    const filename = `${folder}/${currentUser.authId}/${timestamp}-${randomString}.${extension}`;

    // Delete old photo if exists
    const oldPhotoUrl = currentUser.type === 'nanny'
      ? currentUser.nanny.photoUrl
      : currentUser.family.photoUrl;

    if (oldPhotoUrl) {
      // Extract path from URL to delete
      const oldPath = oldPhotoUrl.split('/profile-photos/').pop();
      if (oldPath) {
        await supabase.storage.from('profile-photos').remove([oldPath]);
      }
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(filename, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error('Error uploading file:', error);
      return NextResponse.json(
        { error: 'Erro ao fazer upload do arquivo' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(data.path);

    // Update database with new photo URL
    if (currentUser.type === 'nanny') {
      await prisma.nanny.update({
        where: { id: currentUser.nanny.id },
        data: { photoUrl: publicUrl },
      });
    } else {
      await prisma.family.update({
        where: { id: currentUser.family.id },
        data: { photoUrl: publicUrl },
      });
    }

    return NextResponse.json({
      url: publicUrl,
      path: data.path,
    });
  } catch (error) {
    console.error('Error in profile photo upload:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * DELETE /api/profile/photo - Remove profile photo
 */
export async function DELETE(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Get current photo URL
    const currentPhotoUrl = currentUser.type === 'nanny'
      ? currentUser.nanny.photoUrl
      : currentUser.family.photoUrl;

    if (currentPhotoUrl) {
      // Extract path from URL to delete
      const path = currentPhotoUrl.split('/profile-photos/').pop();
      if (path) {
        await supabase.storage.from('profile-photos').remove([path]);
      }
    }

    // Update database to remove photo URL
    if (currentUser.type === 'nanny') {
      await prisma.nanny.update({
        where: { id: currentUser.nanny.id },
        data: { photoUrl: null },
      });
    } else {
      await prisma.family.update({
        where: { id: currentUser.family.id },
        data: { photoUrl: null },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in profile photo delete:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
