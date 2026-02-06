/**
 * Custom Hook for API Error Handling
 *
 * Provides utilities for:
 * - Making API calls with automatic error handling
 * - Displaying user-friendly toast notifications
 * - Consistent error formatting
 */

'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { getUserFriendlyMessage } from '@/lib/errors';

interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  success: boolean;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
  code?: string;
  details?: unknown;
}

/**
 * Parse error response from API
 */
function parseApiError(response: ApiErrorResponse): string {
  return response.error || response.message || 'Ocorreu um erro inesperado';
}

/**
 * Custom hook for handling API errors with toast notifications
 */
export function useApiError() {
  /**
   * Show error toast with user-friendly message
   */
  const showError = useCallback((error: unknown, customMessage?: string) => {
    const message = customMessage || getUserFriendlyMessage(error);
    toast.error(message, {
      duration: 5000,
    });
  }, []);

  /**
   * Show success toast
   */
  const showSuccess = useCallback((message: string) => {
    toast.success(message, {
      duration: 3000,
    });
  }, []);

  /**
   * Show info toast
   */
  const showInfo = useCallback((message: string) => {
    toast.info(message, {
      duration: 4000,
    });
  }, []);

  /**
   * Show warning toast
   */
  const showWarning = useCallback((message: string, persistent = false) => {
    toast.warning(message, {
      duration: persistent ? Infinity : 4000,
      closeButton: persistent,
    });
  }, []);

  /**
   * Show loading toast that can be dismissed
   */
  const showLoading = useCallback((message: string = 'Carregando...') => {
    return toast.loading(message);
  }, []);

  /**
   * Dismiss a specific toast
   */
  const dismiss = useCallback((toastId?: string | number) => {
    toast.dismiss(toastId);
  }, []);

  /**
   * Make an API call with automatic error handling
   */
  const apiCall = useCallback(async <T>(
    fetchFn: () => Promise<Response>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      showSuccessToast?: boolean;
      showErrorToast?: boolean;
      loadingMessage?: string;
    }
  ): Promise<ApiResponse<T>> => {
    const {
      successMessage,
      errorMessage,
      showSuccessToast = false,
      showErrorToast = true,
      loadingMessage,
    } = options || {};

    let loadingToastId: string | number | undefined;

    try {
      if (loadingMessage) {
        loadingToastId = toast.loading(loadingMessage);
      }

      const response = await fetchFn();

      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        const message = errorMessage || parseApiError(errorData);

        if (showErrorToast) {
          // Show specific messages based on status code
          if (response.status === 401) {
            toast.error('Você precisa fazer login para continuar');
          } else if (response.status === 403) {
            toast.error('Você não tem permissão para esta ação');
          } else if (response.status === 404) {
            toast.error('Recurso não encontrado');
          } else if (response.status === 429) {
            toast.error('Muitas requisições. Aguarde um momento');
          } else {
            toast.error(message);
          }
        }

        return {
          data: null,
          error: message,
          success: false,
        };
      }

      const data = await response.json() as T;

      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }

      const message = errorMessage || getUserFriendlyMessage(error);

      if (showErrorToast) {
        toast.error(message);
      }

      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('API Call Error:', error);
      }

      return {
        data: null,
        error: message,
        success: false,
      };
    }
  }, []);

  /**
   * Wrapper for form submissions with loading state
   */
  const submitForm = useCallback(async <T>(
    fetchFn: () => Promise<Response>,
    options?: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
    }
  ): Promise<ApiResponse<T>> => {
    return apiCall<T>(fetchFn, {
      loadingMessage: options?.loadingMessage || 'Salvando...',
      successMessage: options?.successMessage,
      errorMessage: options?.errorMessage,
      showSuccessToast: !!options?.successMessage,
      showErrorToast: true,
    });
  }, [apiCall]);

  return {
    showError,
    showSuccess,
    showInfo,
    showWarning,
    showLoading,
    dismiss,
    apiCall,
    submitForm,
  };
}

/**
 * Utility function for simple error display (can be used outside React components)
 */
export function showApiError(error: unknown, customMessage?: string): void {
  const message = customMessage || getUserFriendlyMessage(error);
  toast.error(message, {
    duration: 5000,
  });
}

/**
 * Utility function for simple success display
 */
export function showApiSuccess(message: string): void {
  toast.success(message, {
    duration: 3000,
  });
}
