/**
 * API Route: Verify Email Code
 * POST /api/email/verify
 *
 * Valida código de verificação de email
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Código de verificação é obrigatório' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Get entity data based on user type
    const entity = currentUser.type === 'nanny' ? currentUser.nanny : currentUser.family;

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

    // Check if code exists
    if (!entity.emailVerificationCode) {
      return NextResponse.json(
        {
          error: 'Código de verificação não encontrado',
          message: 'Solicite um novo código de verificação'
        },
        { status: 400 }
      );
    }

    // Check if code expired (24 hours)
    if (entity.emailVerificationSent) {
      const timeSinceSent = Date.now() - entity.emailVerificationSent.getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (timeSinceSent > twentyFourHours) {
        return NextResponse.json(
          {
            error: 'Código expirado',
            message: 'O código de verificação expirou. Solicite um novo código'
          },
          { status: 400 }
        );
      }
    }

    // Validate code
    if (entity.emailVerificationCode !== code.trim()) {
      return NextResponse.json(
        {
          error: 'Código inválido',
          message: 'O código de verificação está incorreto'
        },
        { status: 400 }
      );
    }

    // Mark email as verified based on user type
    if (currentUser.type === 'nanny') {
      await prisma.nanny.update({
        where: { id: entity.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          emailVerificationCode: null, // Clear the code after verification
        },
      });
    } else {
      await prisma.family.update({
        where: { id: entity.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          emailVerificationCode: null, // Clear the code after verification
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'E-mail verificado com sucesso!',
    });
  } catch (error) {
    console.error('Email verification error:', error);

    return NextResponse.json(
      {
        error: 'Erro no servidor',
        message: 'Ocorreu um erro ao verificar o e-mail',
      },
      { status: 500 }
    );
  }
}
