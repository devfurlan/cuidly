import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAdminClient } from '@/utils/supabase/server';
import {
  generateValidationReport,
  uploadReportToStorage,
} from '@/services/validation-report';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

/**
 * GET /api/validation/report - Gera e retorna o relatório PDF de validação
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({ error: 'Apenas babas podem acessar relatórios de validação' }, { status: 403 });
    }

    const nannyId = currentUser.nanny.id;

    // Buscar validação
    const validation = await prisma.validationRequest.findUnique({
      where: { nannyId },
    });

    if (!validation) {
      return NextResponse.json({ error: 'Validação não encontrada' }, { status: 404 });
    }

    if (validation.level !== 'PREMIUM' || validation.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Relatório disponível apenas para validação premium concluída' },
        { status: 400 }
      );
    }

    // Verificar se já existe relatório
    if (validation.reportUrl) {
      const adminSupabase = createAdminClient();
      const { data: signedData } = await adminSupabase.storage
        .from('documents')
        .createSignedUrl(validation.reportUrl, 3600); // 1 hora

      if (signedData?.signedUrl) {
        return NextResponse.json({ reportUrl: signedData.signedUrl });
      }
    }

    // Gerar novo relatório
    const pdfBuffer = await generateValidationReport(validation.id);

    // Upload para storage
    const reportPath = await uploadReportToStorage(
      pdfBuffer,
      nannyId,
      validation.id
    );

    // Atualizar validação com URL do relatório
    await prisma.validationRequest.update({
      where: { id: validation.id },
      data: { reportUrl: reportPath },
    });

    // Gerar URL assinada
    const adminSupabase = createAdminClient();
    const { data: signedData } = await adminSupabase.storage
      .from('documents')
      .createSignedUrl(reportPath, 3600);

    return NextResponse.json({ reportUrl: signedData?.signedUrl || null });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * POST /api/validation/report - Forca regeneracao do relatório
 */
export async function POST() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({ error: 'Apenas babás podem regenerar relatórios de validação' }, { status: 403 });
    }

    const nannyId = currentUser.nanny.id;

    const validation = await prisma.validationRequest.findUnique({
      where: { nannyId },
    });

    if (!validation) {
      return NextResponse.json({ error: 'Validação não encontrada' }, { status: 404 });
    }

    if (validation.level !== 'PREMIUM' || validation.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Relatório disponível apenas para validação premium concluída' },
        { status: 400 }
      );
    }

    // Deletar relatório antigo se existir
    if (validation.reportUrl) {
      const adminSupabase = createAdminClient();
      await adminSupabase.storage.from('documents').remove([validation.reportUrl]);
    }

    // Gerar novo relatório
    const pdfBuffer = await generateValidationReport(validation.id);
    const reportPath = await uploadReportToStorage(
      pdfBuffer,
      nannyId,
      validation.id
    );

    await prisma.validationRequest.update({
      where: { id: validation.id },
      data: { reportUrl: reportPath },
    });

    const adminSupabase = createAdminClient();
    const { data: signedData } = await adminSupabase.storage
      .from('documents')
      .createSignedUrl(reportPath, 3600);

    return NextResponse.json({
      success: true,
      reportUrl: signedData?.signedUrl || null,
      message: 'Relatorio gerado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao regenerar relatório:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
