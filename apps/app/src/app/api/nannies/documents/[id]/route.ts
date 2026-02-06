/**
 * Nanny Document by ID API
 * PUT /api/nannies/documents/[id] - Update a document
 * DELETE /api/nannies/documents/[id] - Delete a document
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAdminClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function PUT(
  request: NextRequest,
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

    // Check if document belongs to this nanny
    const existingDoc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existingDoc || existingDoc.nannyId !== currentUser.nanny.id) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
    }

    const formData = await request.formData();
    const courseName = formData.get('courseName') as string;
    const institutionName = formData.get('institutionName') as string;
    const certificateType = formData.get('certificateType') as string;
    const issueDate = formData.get('issueDate') as string | null;
    const file = formData.get('file') as File | null;

    // Upload new file if provided
    let fileUrl = existingDoc.fileUrl;
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `nanny-${currentUser.nanny.id}/certificates/${Date.now()}.${fileExt}`;

      // Use admin client for storage operations to bypass RLS
      const adminSupabase = createAdminClient();
      const { data: uploadData, error: uploadError } = await adminSupabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return NextResponse.json(
          { error: 'Erro ao fazer upload do arquivo' },
          { status: 500 }
        );
      }

      // Store the path (not public URL) since bucket is private
      fileUrl = uploadData.path;
    }

    // Update document
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        identifier: courseName || existingDoc.identifier,
        institutionName: institutionName || existingDoc.institutionName,
        certificateType: certificateType as 'GRADUATION' | 'TECHNICAL' | 'SPECIALIZATION' | 'OTHER' || existingDoc.certificateType,
        issueDate: issueDate ? new Date(issueDate) : existingDoc.issueDate,
        fileUrl,
      },
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if document belongs to this nanny
    const existingDoc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existingDoc || existingDoc.nannyId !== currentUser.nanny.id) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
    }

    // Soft delete document
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
