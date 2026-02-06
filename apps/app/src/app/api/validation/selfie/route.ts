import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAdminClient } from '@/utils/supabase/server';
import { getBigIDClient } from '@/lib/bigid';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { LIVENESS_MIN_SCORE } from '@cuidly/core/validation';

/**
 * POST /api/validation/selfie - Validação de Selfie (Prova de Vida / Liveness)
 * Requer: plano Pro ativo
 * Usa o serviço BigID Liveness da BigDataCorp
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json(
        { error: 'Apenas babás podem fazer validação de selfie' },
        { status: 403 }
      );
    }

    const nannyId = currentUser.nanny.id;

    // Registrar log de consentimento (LGPD)
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded
      ? forwarded.split(',')[0].trim()
      : request.headers.get('x-real-ip');

    await prisma.validationConsentLog.create({
      data: {
        nannyId,
        validationType: 'SELFIE',
        ipAddress,
      },
    });

    // Buscar dados da babá
    const nanny = await prisma.nanny.findUnique({
      where: { id: nannyId },
      include: {
        subscription: true,
        documentUploads: {
          where: { type: 'SELFIE' },
        },
      },
    });

    if (!nanny) {
      return NextResponse.json(
        { error: 'Perfil de babá não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se tem plano Pro ativo
    const hasActivePlan =
      nanny.subscription?.status === 'ACTIVE' &&
      nanny.subscription?.plan === 'NANNY_PRO';

    if (!hasActivePlan) {
      return NextResponse.json(
        { error: 'Validação de selfie disponível apenas para assinantes Pro' },
        { status: 403 }
      );
    }

    // Verificar se já foi validado
    if (nanny.personalDataValidated) {
      return NextResponse.json(
        { error: 'Validação de selfie já foi concluída' },
        { status: 400 }
      );
    }

    // Verificar se selfie foi enviada
    const selfieUpload = nanny.documentUploads[0];
    if (!selfieUpload) {
      return NextResponse.json(
        { error: 'Envie uma selfie antes de continuar' },
        { status: 400 }
      );
    }

    // Obter URL assinada para a selfie
    const adminSupabase = createAdminClient();
    const { data: selfieUrl } = await adminSupabase.storage
      .from('documents')
      .createSignedUrl(selfieUpload.url, 3600);

    if (!selfieUrl?.signedUrl) {
      return NextResponse.json(
        { error: 'Erro ao acessar selfie' },
        { status: 500 }
      );
    }

    try {
      // Chamar BigID Liveness
      const bigidClient = getBigIDClient();
      const livenessResult = await bigidClient.validateLiveness(
        selfieUrl.signedUrl
      );

      // Buscar ou criar ValidationRequest
      let validationRequest = await prisma.validationRequest.findUnique({
        where: { nannyId },
      });

      if (!validationRequest) {
        // Criar ValidationRequest mínimo se não existir
        validationRequest = await prisma.validationRequest.create({
          data: {
            nannyId,
            cpf: '', // Será preenchido na validação básica
            name: nanny.name || '',
            level: 'BASIC',
            status: 'PENDING',
          },
        });
      }

      // Atualizar ValidationRequest com resultado do liveness
      await prisma.validationRequest.update({
        where: { id: validationRequest.id },
        data: {
          livenessScore: livenessResult.score,
          bigidResult: {
            liveness: {
              score: livenessResult.score,
              isValid: livenessResult.isValid,
              error: livenessResult.error,
              validatedAt: new Date().toISOString(),
            },
          },
        },
      });

      if (!livenessResult.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validação de selfie falhou. Tente novamente com uma foto mais clara.',
            score: livenessResult.score,
            minScore: LIVENESS_MIN_SCORE,
            details: livenessResult.error,
          },
          { status: 400 }
        );
      }

      // Atualizar perfil da babá
      await prisma.nanny.update({
        where: { id: nanny.id },
        data: {
          personalDataValidated: true,
          personalDataValidatedAt: new Date(),
          personalDataValidatedBy: 'BigID-Liveness',
        },
      });

      return NextResponse.json({
        success: true,
        score: livenessResult.score,
        minScore: LIVENESS_MIN_SCORE,
        message: 'Selfie validada com sucesso! Selo atualizado no seu perfil.',
      });
    } catch (validationError) {
      console.error('Erro durante validação de selfie:', validationError);

      return NextResponse.json(
        { error: 'Erro durante a validação. Tente novamente.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro ao processar validação de selfie:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/validation/selfie - Retorna o status da validação de selfie
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json(
        { error: 'Apenas babás podem acessar status de validação' },
        { status: 403 }
      );
    }

    const nannyId = currentUser.nanny.id;

    const nanny = await prisma.nanny.findUnique({
      where: { id: nannyId },
      select: {
        personalDataValidated: true,
        personalDataValidatedAt: true,
        personalDataValidatedBy: true,
        validationRequest: {
          select: {
            livenessScore: true,
          },
        },
        documentUploads: {
          where: { type: 'SELFIE' },
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    if (!nanny) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      validated: nanny.personalDataValidated,
      validatedAt: nanny.personalDataValidatedAt,
      validatedBy: nanny.personalDataValidatedBy,
      livenessScore: nanny.validationRequest?.livenessScore,
      hasSelfieUploaded: nanny.documentUploads.length > 0,
    });
  } catch (error) {
    console.error('Erro ao buscar status de validação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
