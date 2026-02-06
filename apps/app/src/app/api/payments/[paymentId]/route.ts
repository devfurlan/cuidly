import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { AsaasGateway } from '@/lib/payment/asaas-gateway';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Tipos para metadata do pagamento
interface PixMetadata {
  pixQrCode: string;
  pixCopyPaste: string;
  pixExpiresAt: string;
}

interface CardMetadata {
  cardLastDigits?: string;
  cardBrand?: string;
}

/**
 * GET /api/payments/[paymentId]
 * Retorna detalhes de um pagamento específico
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { paymentId } = await params;

    // Determinar campo de busca baseado no tipo de usuário
    const entityIdField = currentUser.type === 'nanny'
      ? { nannyId: currentUser.nanny.id }
      : { familyId: currentUser.family.id };

    // Buscar pagamento
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        ...entityIdField, // Garantir que o pagamento pertence ao usuário
      },
      include: {
        subscription: {
          select: {
            id: true,
            plan: true,
            billingInterval: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 },
      );
    }

    // Se for PIX pendente e tiver externalPaymentId, buscar QR Code atualizado do Asaas
    let pixData = null;
    if (
      payment.paymentMethod === 'PIX' &&
      payment.status === 'PENDING' &&
      payment.externalPaymentId
    ) {
      // Primeiro tentar usar os dados salvos no metadata
      const metadata = payment.metadata as PixMetadata | null;
      if (metadata?.pixQrCode && metadata?.pixCopyPaste) {
        pixData = {
          qrCodeImage: metadata.pixQrCode,
          copyPaste: metadata.pixCopyPaste,
          expiresAt: metadata.pixExpiresAt,
        };
      } else {
        // Se não tiver no metadata, buscar do Asaas
        const gateway = new AsaasGateway();
        const qrCodeResult = await gateway.getPixQrCode(payment.externalPaymentId);

        if (qrCodeResult.success && qrCodeResult.data) {
          pixData = {
            qrCodeImage: qrCodeResult.data.encodedImage,
            copyPaste: qrCodeResult.data.payload,
            expiresAt: qrCodeResult.data.expirationDate,
          };

          // Atualizar metadata com os dados do PIX
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              metadata: {
                pixQrCode: qrCodeResult.data.encodedImage,
                pixCopyPaste: qrCodeResult.data.payload,
                pixExpiresAt: qrCodeResult.data.expirationDate,
              },
            },
          });
        }
      }
    }

    // Extrair dados do cartão do metadata se for cartão
    let cardData = null;
    if (payment.paymentMethod === 'CREDIT_CARD') {
      const metadata = payment.metadata as CardMetadata | null;
      if (metadata) {
        cardData = {
          lastDigits: metadata.cardLastDigits,
          brand: metadata.cardBrand,
        };
      }
    }

    return NextResponse.json({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      type: payment.type,
      description: payment.description,
      paymentMethod: payment.paymentMethod,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      externalPaymentId: payment.externalPaymentId,
      externalInvoiceUrl: payment.externalInvoiceUrl,
      subscription: payment.subscription,
      pixData,
      cardData,
    });

  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
