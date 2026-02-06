/**
 * Generate signed URL for document
 * GET /api/nannies/documents/[id]/signed-url
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAdminClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const documentId = parseInt(id, 10);

    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Get document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || document.nannyId !== currentUser.nanny.id) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
    }

    if (!document.fileUrl) {
      return NextResponse.json({ error: 'Documento sem arquivo' }, { status: 404 });
    }

    // Generate signed URL (valid for 1 hour)
    const adminSupabase = createAdminClient();

    // Check if fileUrl is a full URL (old format) or just a path (new format)
    let filePath = document.fileUrl;
    if (filePath.includes('/storage/v1/object/public/documents/')) {
      // Extract path from old public URL format
      filePath = filePath.split('/storage/v1/object/public/documents/')[1];
    }

    const { data, error } = await adminSupabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600); // 1 hour

    if (error) {
      console.error('Error creating signed URL:', error);
      return NextResponse.json(
        { error: 'Erro ao gerar URL do documento' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
