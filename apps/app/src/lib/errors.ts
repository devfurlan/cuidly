/**
 * Centralized Error Handling Utilities
 *
 * Provides:
 * - Custom error classes for different scenarios
 * - Error logging with environment awareness
 * - User-friendly error messages
 */

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Predefined error types with user-friendly messages
 */
export const ErrorTypes = {
  // Authentication errors
  UNAUTHORIZED: {
    message: 'Você precisa estar logado para acessar este recurso',
    statusCode: 401,
    code: 'UNAUTHORIZED',
  },
  INVALID_CREDENTIALS: {
    message: 'Email ou senha incorretos',
    statusCode: 401,
    code: 'INVALID_CREDENTIALS',
  },
  SESSION_EXPIRED: {
    message: 'Sua sessão expirou. Por favor, faça login novamente',
    statusCode: 401,
    code: 'SESSION_EXPIRED',
  },

  // Authorization errors
  FORBIDDEN: {
    message: 'Você não tem permissão para realizar esta ação',
    statusCode: 403,
    code: 'FORBIDDEN',
  },
  SUBSCRIPTION_REQUIRED: {
    message: 'Você precisa de uma assinatura ativa para usar este recurso',
    statusCode: 403,
    code: 'SUBSCRIPTION_REQUIRED',
  },

  // Validation errors
  VALIDATION_ERROR: {
    message: 'Os dados fornecidos são inválidos',
    statusCode: 400,
    code: 'VALIDATION_ERROR',
  },
  MISSING_FIELDS: {
    message: 'Campos obrigatórios não preenchidos',
    statusCode: 400,
    code: 'MISSING_FIELDS',
  },
  INVALID_FORMAT: {
    message: 'Formato de dados inválido',
    statusCode: 400,
    code: 'INVALID_FORMAT',
  },

  // Resource errors
  NOT_FOUND: {
    message: 'Recurso não encontrado',
    statusCode: 404,
    code: 'NOT_FOUND',
  },
  ALREADY_EXISTS: {
    message: 'Este recurso já existe',
    statusCode: 409,
    code: 'ALREADY_EXISTS',
  },

  // Server errors
  INTERNAL_ERROR: {
    message: 'Ocorreu um erro interno. Tente novamente mais tarde',
    statusCode: 500,
    code: 'INTERNAL_ERROR',
  },
  DATABASE_ERROR: {
    message: 'Erro ao acessar o banco de dados. Tente novamente',
    statusCode: 500,
    code: 'DATABASE_ERROR',
  },
  EXTERNAL_SERVICE_ERROR: {
    message: 'Erro ao comunicar com serviço externo. Tente novamente',
    statusCode: 502,
    code: 'EXTERNAL_SERVICE_ERROR',
  },

  // Rate limiting
  TOO_MANY_REQUESTS: {
    message: 'Muitas requisições. Aguarde um momento e tente novamente',
    statusCode: 429,
    code: 'TOO_MANY_REQUESTS',
  },
} as const;

export type ErrorType = keyof typeof ErrorTypes;

/**
 * Create an API error from a predefined type
 */
export function createApiError(
  type: ErrorType,
  customMessage?: string,
  details?: unknown
): ApiError {
  const errorDef = ErrorTypes[type];
  return new ApiError(
    customMessage || errorDef.message,
    errorDef.statusCode,
    errorDef.code,
    details
  );
}

/**
 * Log error with environment awareness
 * In development: logs to console with full details
 * In production: could be extended to log to external service
 */
export function logError(
  error: unknown,
  context?: {
    route?: string;
    userId?: string;
    action?: string;
    metadata?: Record<string, unknown>;
  }
): void {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    ...context,
    error: error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: isDevelopment ? error.stack : undefined,
          ...(error instanceof ApiError && {
            statusCode: error.statusCode,
            code: error.code,
            details: error.details,
          }),
        }
      : { message: String(error) },
  };

  if (isDevelopment) {
    console.error('🔴 [API Error]', JSON.stringify(errorInfo, null, 2));
  } else {
    // In production, log without stack traces
    // Could be extended to send to logging service (Sentry, LogRocket, etc.)
    console.error('[API Error]', JSON.stringify({
      ...errorInfo,
      error: {
        ...errorInfo.error,
        stack: undefined,
      },
    }));

    // TODO: Send to external logging service
    // Example:
    // await sendToSentry(errorInfo);
    // await sendToLogRocket(errorInfo);
  }
}

/**
 * Get user-friendly error message from any error
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Map common error messages to user-friendly versions
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente';
    }
    if (message.includes('timeout')) {
      return 'A operação demorou muito. Tente novamente';
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return ErrorTypes.UNAUTHORIZED.message;
    }
    if (message.includes('forbidden') || message.includes('403')) {
      return ErrorTypes.FORBIDDEN.message;
    }
    if (message.includes('not found') || message.includes('404')) {
      return ErrorTypes.NOT_FOUND.message;
    }
  }

  return ErrorTypes.INTERNAL_ERROR.message;
}

/**
 * Format API response for errors
 */
export function formatErrorResponse(error: unknown): {
  error: string;
  code: string;
  details?: unknown;
} {
  if (error instanceof ApiError) {
    return {
      error: error.message,
      code: error.code,
      details: isDevelopment ? error.details : undefined,
    };
  }

  return {
    error: getUserFriendlyMessage(error),
    code: 'INTERNAL_ERROR',
  };
}
