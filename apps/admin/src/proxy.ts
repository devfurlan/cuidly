import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createClient } from './lib/supabase/server';
import { AdminPermission } from '@prisma/client';
import {
  AuthorizationError,
  requirePermissionApi,
  requireAnyPermissionApi,
  requireSuperAdminApi,
  UserWithPermissions,
} from '@/lib/auth/checkPermission';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Wrapper basico de autenticacao para rotas de API
 */
export function withAuth<T = unknown>(
  handler: (request: Request, context?: T) => Promise<Response>
) {
  return async (request: Request, context?: T) => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return handler(request, context);
  };
}

/**
 * Handler de erros de autorizacao
 */
function handleAuthError(error: unknown): Response {
  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Re-throw se nao for erro de autorizacao
  throw error;
}

/**
 * Wrapper de autenticacao + autorizacao com permissao especifica
 * Retorna 401 se nao autenticado, 403 se nao autorizado
 */
export function withPermission<T = unknown>(
  permission: AdminPermission,
  handler: (
    request: Request,
    context: T | undefined,
    user: UserWithPermissions
  ) => Promise<Response>
) {
  return async (request: Request, context?: T) => {
    try {
      const user = await requirePermissionApi(permission);
      return handler(request, context, user);
    } catch (error) {
      return handleAuthError(error);
    }
  };
}

/**
 * Wrapper de autenticacao + autorizacao com multiplas permissoes (OR)
 * Retorna 401 se nao autenticado, 403 se nao autorizado
 */
export function withAnyPermission<T = unknown>(
  permissions: AdminPermission[],
  handler: (
    request: Request,
    context: T | undefined,
    user: UserWithPermissions
  ) => Promise<Response>
) {
  return async (request: Request, context?: T) => {
    try {
      const user = await requireAnyPermissionApi(permissions);
      return handler(request, context, user);
    } catch (error) {
      return handleAuthError(error);
    }
  };
}

/**
 * Wrapper de autenticacao + autorizacao para super admin
 * Retorna 401 se nao autenticado, 403 se nao for super admin
 */
export function withSuperAdmin<T = unknown>(
  handler: (
    request: Request,
    context: T | undefined,
    user: UserWithPermissions
  ) => Promise<Response>
) {
  return async (request: Request, context?: T) => {
    try {
      const user = await requireSuperAdminApi();
      return handler(request, context, user);
    } catch (error) {
      return handleAuthError(error);
    }
  };
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
