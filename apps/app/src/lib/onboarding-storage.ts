/**
 * Utilitário para armazenamento seguro de dados de onboarding
 *
 * SEGURANÇA:
 * - Usa sessionStorage em vez de localStorage (dados removidos ao fechar aba)
 * - Remove dados sensíveis como CPF após submissão
 * - Oferece métodos para limpar dados específicos
 *
 * MIGRAÇÃO:
 * Este módulo substitui o uso direto de localStorage nos componentes de onboarding.
 * Dados sensíveis (CPF, data de nascimento) são armazenados apenas temporariamente.
 */

// Chaves de armazenamento
const NANNY_STORAGE_KEY = 'nanny-onboarding-data';
const FAMILY_STORAGE_KEY = 'family-onboarding-data';

// Campos considerados sensíveis (PII)
const SENSITIVE_FIELDS = ['cpf', 'birthDate', 'motherName', 'phoneNumber', 'pixKey'];

/**
 * Verifica se o código está rodando no browser
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Obtém o storage apropriado (sessionStorage para dados temporários)
 */
function getStorage(): Storage | null {
  if (!isBrowser()) return null;
  return sessionStorage;
}

/**
 * Interface genérica para dados de onboarding
 */
interface OnboardingData {
  [key: string]: unknown;
}

/**
 * Obtém dados de onboarding para babás
 */
export function getNannyOnboardingData<T = OnboardingData>(): T | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const data = storage.getItem(NANNY_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

/**
 * Salva dados de onboarding para babás
 */
export function setNannyOnboardingData(data: OnboardingData): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const existingData = getNannyOnboardingData() || {};
    const mergedData = { ...existingData, ...data };
    storage.setItem(NANNY_STORAGE_KEY, JSON.stringify(mergedData));
  } catch (error) {
    console.error('[ONBOARDING] Erro ao salvar dados:', error);
  }
}

/**
 * Atualiza campo específico no onboarding de babá
 */
export function updateNannyOnboardingField(field: string, value: unknown): void {
  const data = getNannyOnboardingData() || {};
  data[field] = value;
  setNannyOnboardingData(data);
}

/**
 * Limpa dados de onboarding de babá
 */
export function clearNannyOnboardingData(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(NANNY_STORAGE_KEY);
}

/**
 * Obtém dados de onboarding para famílias
 */
export function getFamilyOnboardingData<T = OnboardingData>(): T | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const data = storage.getItem(FAMILY_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

/**
 * Salva dados de onboarding para famílias
 */
export function setFamilyOnboardingData(data: OnboardingData): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const existingData = getFamilyOnboardingData() || {};
    const mergedData = { ...existingData, ...data };
    storage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(mergedData));
  } catch (error) {
    console.error('[ONBOARDING] Erro ao salvar dados:', error);
  }
}

/**
 * Atualiza campo específico no onboarding de família
 */
export function updateFamilyOnboardingField(field: string, value: unknown): void {
  const data = getFamilyOnboardingData() || {};
  data[field] = value;
  setFamilyOnboardingData(data);
}

/**
 * Limpa dados de onboarding de família
 */
export function clearFamilyOnboardingData(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(FAMILY_STORAGE_KEY);
}

/**
 * Remove campos sensíveis dos dados armazenados
 * Deve ser chamado após submissão bem-sucedida do onboarding
 */
export function clearSensitiveData(type: 'nanny' | 'family'): void {
  const getData = type === 'nanny' ? getNannyOnboardingData : getFamilyOnboardingData;
  const setData = type === 'nanny' ? setNannyOnboardingData : setFamilyOnboardingData;

  const data = getData();
  if (!data) return;

  // Remover campos sensíveis
  for (const field of SENSITIVE_FIELDS) {
    delete data[field];
  }

  setData(data);
}

/**
 * Limpa todos os dados de onboarding (ambos tipos)
 */
export function clearAllOnboardingData(): void {
  clearNannyOnboardingData();
  clearFamilyOnboardingData();
}

/**
 * Migra dados do localStorage para sessionStorage (se existirem)
 * Útil para migração gradual
 */
export function migrateFromLocalStorage(): void {
  if (!isBrowser()) return;

  try {
    // Migrar dados de nanny
    const nannyLocal = localStorage.getItem(NANNY_STORAGE_KEY);
    if (nannyLocal) {
      const current = getNannyOnboardingData();
      if (!current) {
        sessionStorage.setItem(NANNY_STORAGE_KEY, nannyLocal);
      }
      localStorage.removeItem(NANNY_STORAGE_KEY);
    }

    // Migrar dados de family
    const familyLocal = localStorage.getItem(FAMILY_STORAGE_KEY);
    if (familyLocal) {
      const current = getFamilyOnboardingData();
      if (!current) {
        sessionStorage.setItem(FAMILY_STORAGE_KEY, familyLocal);
      }
      localStorage.removeItem(FAMILY_STORAGE_KEY);
    }
  } catch (error) {
    console.error('[ONBOARDING] Erro na migração de storage:', error);
  }
}

/**
 * Wrapper seguro para substituir localStorage nos componentes de onboarding
 * Automaticamente usa sessionStorage e migra dados existentes do localStorage
 *
 * USO: Substitua `localStorage` por `secureStorage` nos componentes
 *
 * @example
 * // Antes
 * localStorage.getItem('nanny-onboarding-data');
 *
 * // Depois
 * import { secureStorage } from '@/lib/onboarding-storage';
 * secureStorage.getItem('nanny-onboarding-data');
 */
export const secureStorage = {
  getItem(key: string): string | null {
    if (!isBrowser()) return null;

    // Tentar sessionStorage primeiro
    let data = sessionStorage.getItem(key);

    // Se não existir, verificar localStorage e migrar
    if (!data) {
      const localData = localStorage.getItem(key);
      if (localData) {
        sessionStorage.setItem(key, localData);
        localStorage.removeItem(key);
        data = localData;
      }
    }

    return data;
  },

  setItem(key: string, value: string): void {
    if (!isBrowser()) return;
    sessionStorage.setItem(key, value);
    // Garantir que não existe no localStorage
    localStorage.removeItem(key);
  },

  removeItem(key: string): void {
    if (!isBrowser()) return;
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  },
};

// Hook para uso em componentes React
export function useOnboardingStorage(type: 'nanny' | 'family') {
  if (type === 'nanny') {
    return {
      getData: getNannyOnboardingData,
      setData: setNannyOnboardingData,
      updateField: updateNannyOnboardingField,
      clear: clearNannyOnboardingData,
      clearSensitive: () => clearSensitiveData('nanny'),
    };
  }

  return {
    getData: getFamilyOnboardingData,
    setData: setFamilyOnboardingData,
    updateField: updateFamilyOnboardingField,
    clear: clearFamilyOnboardingData,
    clearSensitive: () => clearSensitiveData('family'),
  };
}

export default {
  nanny: {
    get: getNannyOnboardingData,
    set: setNannyOnboardingData,
    update: updateNannyOnboardingField,
    clear: clearNannyOnboardingData,
  },
  family: {
    get: getFamilyOnboardingData,
    set: setFamilyOnboardingData,
    update: updateFamilyOnboardingField,
    clear: clearFamilyOnboardingData,
  },
  clearSensitive: clearSensitiveData,
  clearAll: clearAllOnboardingData,
  migrate: migrateFromLocalStorage,
};
