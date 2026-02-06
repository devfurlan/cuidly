/**
 * Nanny Documents API
 * GET /api/nannies/documents - List nanny documents (certificates)
 * POST /api/nannies/documents - Create a new document/certificate
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAdminClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET(_request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Fetch documents for this nanny
    const documents = await prisma.document.findMany({
      where: {
        nannyId: currentUser.nanny.id,
        status: 'ACTIVE',
        documentType: 'CERTIFICATE',
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching nanny documents:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const formData = await request.formData();
    const courseName = formData.get('courseName') as string;
    const institutionName = formData.get('institutionName') as string;
    const certificateType = formData.get('certificateType') as string;
    const issueDate = formData.get('issueDate') as string | null;
    const file = formData.get('file') as File | null;

    if (!courseName || !institutionName || !certificateType) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não informados' },
        { status: 400 }
      );
    }

    // Upload file if provided
    let fileUrl: string | null = null;
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

    // Create document
    const document = await prisma.document.create({
      data: {
        nannyId: currentUser.nanny.id,
        documentType: 'CERTIFICATE',
        identifier: courseName,
        institutionName,
        certificateType: certificateType as 'GRADUATION' | 'TECHNICAL' | 'SPECIALIZATION' | 'OTHER',
        issueDate: issueDate ? new Date(issueDate) : null,
        fileUrl,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
