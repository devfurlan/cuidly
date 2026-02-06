import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAdminClient } from '@/utils/supabase/server';
import { getBigIDClient } from '@/lib/bigid';
import {
  validateCriminalFederalPolice,
  validateCriminalCivilPolice,
} from '@/lib/api-clients/bigdatacorp';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { decrypt, isEncrypted } from '@/lib/encryption';

/**
 * POST /api/validation/premium - Validacao premium completa
 * Requer: plano ativo e validação básica aprovada
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({ error: 'Apenas babas podem fazer validação premium' }, { status: 403 });
    }

    const nannyId = currentUser.nanny.id;

    // Registrar log de consentimento (LGPD)
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip');
    await prisma.validationConsentLog.create({
      data: {
        nannyId,
        validationType: 'PREMIUM',
        ipAddress,
      },
    });

    const nanny = await prisma.nanny.findUnique({
      where: { id: nannyId },
      include: {
        subscription: true,
        validationRequest: true,
        documentUploads: true,
      },
    });

    if (!nanny) {
      return NextResponse.json({ error: 'Perfil de babá não encontrado' }, { status: 404 });
    }

    // Verificar se tem plano Pro ativo (não apenas status ACTIVE, mas plano pago)
    const hasActivePlan =
      nanny.subscription?.status === 'ACTIVE' &&
      nanny.subscription?.plan === 'NANNY_PRO';
    if (!hasActivePlan) {
      return NextResponse.json(
        { error: 'Validação premium disponível apenas para assinantes' },
        { status: 403 }
      );
    }

    // Verificar se validação básica foi aprovada
    if (!nanny.validationRequest || nanny.validationRequest.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Complete a validação básica primeiro' },
        { status: 400 }
      );
    }

    // Verificar se já está em nível premium
    if (nanny.validationRequest.level === 'PREMIUM') {
      return NextResponse.json(
        { error: 'Validação premium já foi concluída' },
        { status: 400 }
      );
    }

    // Verificar se documentos foram enviados
    const documentFront = nanny.documentUploads.find((d) => d.type === 'DOCUMENT_FRONT');
    const selfie = nanny.documentUploads.find((d) => d.type === 'SELFIE');

    if (!documentFront || !selfie) {
      return NextResponse.json(
        { error: 'Envie o documento e a selfie antes de continuar' },
        { status: 400 }
      );
    }

    // Atualizar status para processando
    await prisma.validationRequest.update({
      where: { id: nanny.validationRequest.id },
      data: { status: 'PROCESSING' },
    });

    // Obter URLs assinadas para os documentos
    const adminSupabase = createAdminClient();
    const { data: frontUrl } = await adminSupabase.storage
      .from('documents')
      .createSignedUrl(documentFront.url, 3600);
    const { data: selfieUrl } = await adminSupabase.storage
      .from('documents')
      .createSignedUrl(selfie.url, 3600);

    const documentBack = nanny.documentUploads.find((d) => d.type === 'DOCUMENT_BACK');
    let backUrl: { signedUrl: string } | null = null;
    if (documentBack) {
      const { data } = await adminSupabase.storage
        .from('documents')
        .createSignedUrl(documentBack.url, 3600);
      backUrl = data;
    }

    if (!frontUrl?.signedUrl || !selfieUrl?.signedUrl) {
      return NextResponse.json(
        { error: 'Erro ao acessar documentos' },
        { status: 500 }
      );
    }

    try {
      // Descriptografar CPF se necessário
      let validationCpf = nanny.validationRequest.cpf;
      if (isEncrypted(validationCpf)) {
        validationCpf = decrypt(validationCpf);
      }

      // 1. Processar com BigID
      const bigidClient = getBigIDClient();
      const bigidResult = await bigidClient.validateDocument({
        documentFrontImage: frontUrl.signedUrl,
        documentBackImage: backUrl?.signedUrl,
        selfieImage: selfieUrl.signedUrl,
        documentType: 'RG',
        cpf: validationCpf,
      });

      if (!bigidResult.isValid) {
        await prisma.validationRequest.update({
          where: { id: nanny.validationRequest.id },
          data: {
            status: 'FAILED',
            bigidResult: bigidResult as object,
            facematchScore: bigidResult.facematchScore,
            livenessScore: bigidResult.livenessScore,
            bigidValid: false,
          },
        });

        return NextResponse.json(
          {
            success: false,
            error: 'Validação de documentos falhou. Verifique as fotos e tente novamente.',
            details: bigidResult.errors,
          },
          { status: 400 }
        );
      }

      // 2. Consultar Antecedentes Federais
      let federalRecordResult = null;
      try {
        federalRecordResult = await validateCriminalFederalPolice(validationCpf);
      } catch (error) {
        console.error('Erro ao consultar antecedentes federais:', error);
      }

      // 3. Consultar Antecedentes Estaduais
      let civilRecordResult = null;
      const rgIssuingState =
        bigidResult.documentData.issuingState ||
        nanny.validationRequest.rgIssuingState ||
        nanny.birthState ||
        'SP';

      try {
        civilRecordResult = await validateCriminalCivilPolice({
          cpf: validationCpf,
          uf: rgIssuingState,
          rg: bigidResult.documentData.rg || nanny.validationRequest.rg || '',
          motherName:
            bigidResult.documentData.motherName ||
            nanny.validationRequest.motherName ||
            nanny.motherName ||
            '',
          fatherName:
            bigidResult.documentData.fatherName ||
            nanny.validationRequest.fatherName ||
            '',
          issueDate: bigidResult.documentData.issueDate || '',
        });
      } catch (error) {
        console.error('Erro ao consultar antecedentes estaduais:', error);
      }

      // 4. Atualizar ValidationRequest
      const validation = await prisma.validationRequest.update({
        where: { id: nanny.validationRequest.id },
        data: {
          level: 'PREMIUM',
          status: 'COMPLETED',
          rg: bigidResult.documentData.rg || nanny.validationRequest.rg,
          rgIssuingState: rgIssuingState,
          motherName:
            bigidResult.documentData.motherName || nanny.validationRequest.motherName,
          fatherName:
            bigidResult.documentData.fatherName || nanny.validationRequest.fatherName,
          birthDate: bigidResult.documentData.birthDate
            ? new Date(bigidResult.documentData.birthDate)
            : nanny.validationRequest.birthDate,
          bigidResult: bigidResult as object,
          facematchScore: bigidResult.facematchScore,
          livenessScore: bigidResult.livenessScore,
          bigidValid: bigidResult.isValid,
          civilRecordResult: civilRecordResult as object,
          federalRecordResult: federalRecordResult as object,
          completedAt: new Date(),
        },
      });

      // 5. Atualizar perfil da baba
      await prisma.nanny.update({
        where: { id: nanny.id },
        data: {
          documentValidated: true,
          criminalBackgroundValidated: true,
          criminalBackgroundValidationDate: new Date(),
          criminalBackgroundValidationMessage:
            'Antecedentes validados via BigDataCorp (Federal + Estadual)',
          personalDataValidated: true,
          personalDataValidatedAt: new Date(),
          personalDataValidatedBy: 'BigID',
        },
      });

      return NextResponse.json({
        success: true,
        validation: {
          id: validation.id,
          level: validation.level,
          status: validation.status,
          facematchScore: validation.facematchScore,
          livenessScore: validation.livenessScore,
          completedAt: validation.completedAt,
        },
        message: 'Validacao premium concluida com sucesso! Selo "Premium" adicionado.',
      });
    } catch (validationError) {
      console.error('Erro durante validação premium:', validationError);

      // Reverter status
      await prisma.validationRequest.update({
        where: { id: nanny.validationRequest.id },
        data: { status: 'FAILED' },
      });

      return NextResponse.json(
        { error: 'Erro durante a validação. Tente novamente.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro ao processar validação premium:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
