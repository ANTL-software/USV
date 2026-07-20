import { useState, useCallback } from 'react';
import { getInjectionCountService, injectProspectsService } from '../API/services/index.ts';
import { useAlert } from '../context/alert/index.ts';
import type { InjectionFilters, InjectionResult } from '../utils/types/index.ts';

const STORAGE_KEY = 'antl_injection_filters';

const loadSavedFilters = (): InjectionFilters => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveFilters = (filters: InjectionFilters) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // sessionStorage plein ou indisponible — silencieux
  }
};

interface UseInjectionReturn {
  filters: InjectionFilters;
  setFilters: (filters: InjectionFilters) => void;
  count: number | null;
  result: InjectionResult | null;
  isLoading: boolean;
  loadCount: (idCampagne: number) => Promise<void>;
  inject: (idCampagne: number) => Promise<void>;
  reset: () => void;
}

export const useInjection = (): UseInjectionReturn => {
  const { showError, showSuccess } = useAlert();
  const [filters, setFiltersState] = useState<InjectionFilters>(loadSavedFilters);
  const [count, setCount] = useState<number | null>(null);
  const [result, setResult] = useState<InjectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setFilters = useCallback((f: InjectionFilters) => {
    setFiltersState(f);
    saveFilters(f);
  }, []);

  const loadCount = useCallback(async (idCampagne: number) => {
    setIsLoading(true);
    try {
      const c = await getInjectionCountService(idCampagne, filters);
      setCount(c);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur lors du comptage';
      showError(msg);
      setCount(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters, showError]);

  const inject = useCallback(async (idCampagne: number) => {
    setIsLoading(true);
    try {
      const r = await injectProspectsService(idCampagne, filters);
      setResult(r);
      showSuccess(`${r.injected} prospects injectés, ${r.skipped} ignorés`);
      setCount(null);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur lors de l\'injection';
      showError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters, showError, showSuccess]);

  const reset = useCallback(() => {
    setFiltersState({});
    sessionStorage.removeItem(STORAGE_KEY);
    setCount(null);
    setResult(null);
  }, []);

  return { filters, setFilters, count, result, isLoading, loadCount, inject, reset };
};
