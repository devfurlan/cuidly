import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateBackgroundCheck } from '@/lib/api-clients/bigdatacorp';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { decrypt, isEncrypted } from '@/lib/encryption';

/**
 * POST /api/validation/background-check - Validação de Antecedentes (Background Check)
 * Requer: plano Pro ativo e CPF no perfil
 * Usa a API Background Check da BigDataCorp com Group = 'baba'
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json(
        { error: 'Apenas babás podem fazer validação de antecedentes' },
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
        validationType: 'BACKGROUND_CHECK',
        ipAddress,
      },
    });

    // Buscar dados da babá
    const nanny = await prisma.nanny.findUnique({
      where: { id: nannyId },
      include: {
        subscription: true,
        validationRequest: true,
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
        {
          error:
            'Validação de antecedentes disponível apenas para assinantes Pro',
        },
        { status: 403 }
      );
    }

    // Verificar se CPF está preenchido
    if (!nanny.cpf) {
      return NextResponse.json(
        { error: 'CPF deve estar preenchido no perfil para esta validação' },
        { status: 400 }
      );
    }

    // Verificar se já foi validado
    if (nanny.criminalBackgroundValidated) {
      return NextResponse.json(
        { error: 'Validação de antecedentes já foi concluída' },
        { status: 400 }
      );
    }

    // Descriptografar CPF se necessário
    let cpf = nanny.cpf;
    if (isEncrypted(cpf)) {
      cpf = decrypt(cpf);
    }

    // Limpar CPF (remover pontos e traços)
    const cleanCpf = cpf.replace(/\D/g, '');

    try {
      // Chamar API de Background Check
      const backgroundCheckResult = await validateBackgroundCheck(cleanCpf);

      if (!backgroundCheckResult) {
        return NextResponse.json(
          { error: 'Erro ao consultar antecedentes. Tente novamente.' },
          { status: 500 }
        );
      }

      // Determinar se passou na validação
      // A API pode retornar diferentes formatos dependendo da configuração do Group
      const decision = backgroundCheckResult.Result?.Decision;
      const isApproved = decision === 'APPROVED' || decision === 'approved';

      // Buscar ou criar ValidationRequest
      let validationRequest = nanny.validationRequest;

      if (!validationRequest) {
        // Criar ValidationRequest se não existir
        validationRequest = await prisma.validationRequest.create({
          data: {
            nannyId,
            cpf: cleanCpf,
            name: nanny.name || '',
            level: 'BASIC',
            status: 'PENDING',
            backgroundCheckResult: backgroundCheckResult as object,
          },
        });
      } else {
        // Atualizar ValidationRequest existente
        validationRequest = await prisma.validationRequest.update({
          where: { id: validationRequest.id },
          data: {
            backgroundCheckResult: backgroundCheckResult as object,
          },
        });
      }

      // Atualizar perfil da babá
      await prisma.nanny.update({
        where: { id: nanny.id },
        data: {
          criminalBackgroundValidated: isApproved,
          criminalBackgroundValidationDate: new Date(),
          criminalBackgroundValidationMessage: isApproved
            ? 'Antecedentes validados via BigDataCorp Background Check'
            : `Validação não aprovada: ${decision || 'Resultado indisponível'}`,
        },
      });

      if (!isApproved) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Não foi possível aprovar sua validação de antecedentes. Entre em contato com o suporte.',
            decision,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        decision,
        message:
          'Antecedentes validados com sucesso! Selo atualizado no seu perfil.',
      });
    } catch (validationError) {
      console.error('Erro durante validação de antecedentes:', validationError);

      return NextResponse.json(
        { error: 'Erro durante a validação. Tente novamente.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro ao processar validação de antecedentes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/validation/background-check - Retorna o status da validação de antecedentes
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
        criminalBackgroundValidated: true,
        criminalBackgroundValidationDate: true,
        criminalBackgroundValidationMessage: true,
        cpf: true,
      },
    });

    if (!nanny) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      validated: nanny.criminalBackgroundValidated,
      validatedAt: nanny.criminalBackgroundValidationDate,
      message: nanny.criminalBackgroundValidationMessage,
      hasCpf: !!nanny.cpf,
    });
  } catch (error) {
    console.error('Erro ao buscar status de validação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
