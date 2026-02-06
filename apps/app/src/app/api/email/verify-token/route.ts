/**
 * API Route: Verify Email via Token (Magic Link)
 * GET /api/email/verify-token?token=xxx
 *
 * Valida email através de token único (magic link)
 */

import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificação é obrigatório' },
        { status: 400 }
      );
    }

    // Try to find nanny by token
    const nanny = await prisma.nanny.findUnique({
      where: { emailVerificationToken: token },
      select: {
        id: true,
        emailVerified: true,
        emailVerificationSent: true,
      },
    });

    // Try to find family by token if nanny not found
    const family = !nanny ? await prisma.family.findUnique({
      where: { emailVerificationToken: token },
      select: {
        id: true,
        emailVerified: true,
        emailVerificationSent: true,
      },
    }) : null;

    const entity = nanny || family;
    const entityType = nanny ? 'nanny' : family ? 'family' : null;

    if (!entity || !entityType) {
      return NextResponse.json(
        {
          error: 'Token inválido',
          message: 'O token de verificação não é válido ou já foi utilizado'
        },
        { status: 400 }
      );
    }

    // Check if email already verified
    if (entity.emailVerified) {
      return NextResponse.json(
        {
          success: true,
          already_verified: true,
          message: 'E-mail já verificado anteriormente'
        }
      );
    }

    // Check if token expired (24 hours)
    if (entity.emailVerificationSent) {
      const timeSinceSent = Date.now() - entity.emailVerificationSent.getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (timeSinceSent > twentyFourHours) {
        return NextResponse.json(
          {
            error: 'Token expirado',
            message: 'O link de verificação expirou. Solicite um novo código'
          },
          { status: 400 }
        );
      }
    }

    // Mark email as verified based on entity type
    if (entityType === 'nanny') {
      await prisma.nanny.update({
        where: { id: entity.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          emailVerificationToken: null, // Clear the token after verification
          emailVerificationCode: null, // Clear the code too
        },
      });
    } else {
      await prisma.family.update({
        where: { id: entity.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          emailVerificationToken: null, // Clear the token after verification
          emailVerificationCode: null, // Clear the code too
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'E-mail verificado com sucesso!',
    });
  } catch (error) {
    console.error('Email verification via token error:', error);

    return NextResponse.json(
      {
        error: 'Erro no servidor',
        message: 'Ocorreu um erro ao verificar o e-mail',
      },
      { status: 500 }
    );
  }
}
