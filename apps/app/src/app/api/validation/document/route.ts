import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  validateDocumentoscopia,
  calculateDocumentExpirationDate,
  getDocumentType,
} from '@/lib/api-clients/bigdatacorp';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { createAdminClient } from '@/utils/supabase/server';

/**
 * POST /api/validation/document - Validação de Documento via Documentoscopia
 * Gratuito para todas as babás
 * Usa a API Documentoscopia da BigDataCorp
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json(
        { error: 'Apenas babás podem validar documentos' },
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
        validationType: 'DOCUMENT',
        ipAddress,
      },
    });

    // Buscar dados da babá
    const nanny = await prisma.nanny.findUnique({
      where: { id: nannyId },
      include: {
        validationRequest: true,
        documentUploads: true,
      },
    });

    if (!nanny) {
      return NextResponse.json(
        { error: 'Perfil de babá não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já foi validado e não está expirado
    if (nanny.documentValidated) {
      const isExpired =
        nanny.documentExpirationDate &&
        new Date(nanny.documentExpirationDate) < new Date();

      if (!isExpired) {
        return NextResponse.json(
          { error: 'Documento já foi validado' },
          { status: 400 }
        );
      }
    }

    // Verificar se tem documento front uploaded
    const documentFront = nanny.documentUploads.find(
      (d) => d.type === 'DOCUMENT_FRONT'
    );

    if (!documentFront) {
      return NextResponse.json(
        { error: 'É necessário fazer upload do documento antes de validar' },
        { status: 400 }
      );
    }

    // Obter URL assinada do documento
    const adminSupabase = createAdminClient();
    const { data: signedFrontData, error: signedFrontError } =
      await adminSupabase.storage
        .from('documents')
        .createSignedUrl(documentFront.url, 3600); // 1 hora

    if (signedFrontError || !signedFrontData?.signedUrl) {
      console.error('Erro ao gerar URL assinada:', signedFrontError);
      return NextResponse.json(
        { error: 'Erro ao acessar documento. Tente fazer upload novamente.' },
        { status: 500 }
      );
    }

    console.log('URL assinada gerada para documento frente:', signedFrontData.signedUrl.substring(0, 100) + '...');

    // Verificar se tem verso do documento
    const documentBack = nanny.documentUploads.find(
      (d) => d.type === 'DOCUMENT_BACK'
    );
    let signedBackUrl: string | undefined;

    if (documentBack) {
      const { data: signedBackData } = await adminSupabase.storage
        .from('documents')
        .createSignedUrl(documentBack.url, 3600);
      signedBackUrl = signedBackData?.signedUrl;
    }

    try {
      // Log dos parâmetros
      console.log('Chamando API Documentoscopia com:', {
        docImgFrontUrl: signedFrontData.signedUrl,
        docImgBackUrl: signedBackUrl || 'N/A',
      });

      // Verificar se a URL é acessível
      try {
        const testFetch = await fetch(signedFrontData.signedUrl, { method: 'HEAD' });
        console.log('URL acessível:', testFetch.ok, 'Status:', testFetch.status, 'Content-Type:', testFetch.headers.get('content-type'));
      } catch (fetchError) {
        console.error('Erro ao verificar URL:', fetchError);
      }

      // Chamar API de Documentoscopia
      const documentoscopiaResult = await validateDocumentoscopia({
        docImgFrontUrl: signedFrontData.signedUrl,
        docImgBackUrl: signedBackUrl,
      });

      if (!documentoscopiaResult) {
        return NextResponse.json(
          { error: 'Erro ao validar documento. Tente novamente.' },
          { status: 500 }
        );
      }

      // Log completo da resposta para debug
      console.log('Resultado Documentoscopia completo:', JSON.stringify(documentoscopiaResult, null, 2));

      // Verificar código de status da resposta (formato real da API)
      const statusCode =
        documentoscopiaResult.ResultCode ??
        documentoscopiaResult.Status?.documentoscopia?.[0]?.Code;
      const statusMessage =
        documentoscopiaResult.ResultMessage ??
        documentoscopiaResult.Status?.documentoscopia?.[0]?.Message;

      console.log('Status code:', statusCode, 'Message:', statusMessage);

      if (statusCode === -704) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Não foi possível extrair informações do documento. Certifique-se de que a imagem está nítida e tente novamente.',
            code: statusCode,
          },
          { status: 400 }
        );
      }

      if (statusCode === -701) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Erro ao processar o documento. Tente novamente com uma imagem mais clara.',
            code: statusCode,
          },
          { status: 400 }
        );
      }

      if (statusCode === -702) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Nenhuma imagem de documento foi encontrada. Verifique se o arquivo enviado é válido.',
            code: statusCode,
          },
          { status: 400 }
        );
      }

      if (statusCode !== 70) {
        return NextResponse.json(
          {
            success: false,
            error: statusMessage || 'Erro desconhecido ao validar documento.',
            code: statusCode,
          },
          { status: 400 }
        );
      }

      // Extrair dados do documento (formato real: DocInfo, fallback: Result[0])
      const docInfo = documentoscopiaResult.DocInfo || documentoscopiaResult.Result?.[0];

      if (!docInfo) {
        return NextResponse.json(
          {
            success: false,
            error: 'Nenhum dado foi extraído do documento.',
          },
          { status: 400 }
        );
      }

      // Determinar tipo de documento e calcular validade
      const docType = getDocumentType(docInfo);
      const expirationDate = calculateDocumentExpirationDate(docInfo);

      // Verificar se o documento já está expirado
      if (expirationDate && expirationDate < new Date()) {
        return NextResponse.json(
          {
            success: false,
            error:
              'O documento enviado está vencido. Por favor, envie um documento válido.',
          },
          { status: 400 }
        );
      }

      // Buscar ou criar ValidationRequest
      let validationRequest = nanny.validationRequest;

      if (!validationRequest) {
        validationRequest = await prisma.validationRequest.create({
          data: {
            nannyId,
            cpf: docInfo.CPF || '',
            name: docInfo.NAME || nanny.name || '',
            level: 'BASIC',
            status: 'COMPLETED',
            documentoscopiaResult: documentoscopiaResult as object,
            completedAt: new Date(),
          },
        });
      } else {
        validationRequest = await prisma.validationRequest.update({
          where: { id: validationRequest.id },
          data: {
            documentoscopiaResult: documentoscopiaResult as object,
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });
      }

      // Atualizar perfil da babá
      await prisma.nanny.update({
        where: { id: nanny.id },
        data: {
          documentValidated: true,
          documentValidationDate: new Date(),
          documentValidationMessage:
            'Documento validado via BigDataCorp Documentoscopia',
          documentType: docType,
          documentExpirationDate: expirationDate,
        },
      });

      return NextResponse.json({
        success: true,
        documentType: docType,
        expirationDate: expirationDate?.toISOString(),
        extractedData: {
          name: docInfo.NAME,
          cpf: docInfo.CPF
            ? `***.***.${docInfo.CPF.slice(-5)}`
            : null,
          birthDate: docInfo.BIRTHDATE,
        },
        message:
          'Documento validado com sucesso! Selo de verificação adicionado ao seu perfil.',
      });
    } catch (validationError) {
      console.error('Erro durante validação de documento:', validationError);

      return NextResponse.json(
        { error: 'Erro durante a validação. Tente novamente.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro ao processar validação de documento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/validation/document - Retorna o status da validação de documento
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
        documentValidated: true,
        documentValidationDate: true,
        documentValidationMessage: true,
        documentType: true,
        documentExpirationDate: true,
      },
    });

    if (!nanny) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se está expirado
    const isExpired =
      nanny.documentExpirationDate &&
      new Date(nanny.documentExpirationDate) < new Date();

    return NextResponse.json({
      validated: nanny.documentValidated && !isExpired,
      validatedAt: nanny.documentValidationDate,
      message: nanny.documentValidationMessage,
      documentType: nanny.documentType,
      expirationDate: nanny.documentExpirationDate,
      isExpired,
    });
  } catch (error) {
    console.error('Erro ao buscar status de validação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
