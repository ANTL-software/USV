import { useCallback, useEffect, useState } from 'react';
import { getCampagneByIdService } from '../API/services/index.ts';
import { useAlert } from '../context/alert/index.ts';
import type { InjectionFilters, InjectionResult } from '../utils/types/index.ts';
import { useInjection } from './useInjection.ts';

const POSTAL_CODE_PATTERN = /^\d{5}$/;

export function useProspectInjection(campagneId: number | null) {
  const { showConfirm, showError } = useAlert();
  const injection = useInjection();
  const { count, filters, inject, isLoading, loadCount, reset, result, setFilters } = injection;
  const [loadedCampagneNom, setLoadedCampagneNom] = useState('');
  const [countModalOpen, setCountModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [hasInjected, setHasInjected] = useState(false);
  const [displayedResult, setDisplayedResult] = useState<InjectionResult | null>(null);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  useEffect(() => {
    if (!campagneId) {
      return;
    }

    let isCancelled = false;
    void getCampagneByIdService(campagneId)
      .then((campagne) => {
        if (!isCancelled) {
          setLoadedCampagneNom(campagne.toJSON().nom_campagne);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLoadedCampagneNom('');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [campagneId]);

  const campagneNom = campagneId ? loadedCampagneNom : '';

  useEffect(() => {
    if (count !== null && !isLoading) {
      queueMicrotask(() => setCountModalOpen(true));
    }
  }, [count, isLoading]);

  useEffect(() => {
    if (result) {
      queueMicrotask(() => {
        setDisplayedResult(result);
        setResultModalOpen(true);
        setHasInjected(true);
        reset();
      });
    }
  }, [reset, result]);

  const validateFilters = useCallback((): boolean => {
    if (!filters.code_postal || !POSTAL_CODE_PATTERN.test(filters.code_postal)) {
      void showError('Un code postal de départ valide (5 chiffres) est requis.');
      return false;
    }

    return true;
  }, [filters.code_postal, showError]);

  const countProspects = useCallback((): void => {
    if (!campagneId || !validateFilters()) {
      return;
    }

    void loadCount(campagneId);
  }, [campagneId, loadCount, validateFilters]);

  const injectProspects = useCallback(async (): Promise<void> => {
    if (!campagneId || !validateFilters()) {
      return;
    }

    const confirmed = await showConfirm(
      'Injecter les prospects correspondants aux filtres dans cette campagne ?',
      "Confirmer l'injection",
    );
    if (confirmed) {
      await inject(campagneId);
    }
  }, [campagneId, inject, showConfirm, validateFilters]);

  const updateFilter = useCallback((key: keyof InjectionFilters, value: string): void => {
    if (key === 'limit') {
      const parsed = value ? Number.parseInt(value, 10) : undefined;
      setFilters({ ...filters, [key]: parsed });
    } else {
      setFilters({ ...filters, [key]: value === '' ? undefined : value });
    }
    setHasInjected(false);
  }, [filters, setFilters]);

  return {
    campagneNom,
    closeCountModal: () => setCountModalOpen(false),
    closeResultModal: () => setResultModalOpen(false),
    count,
    countModalOpen,
    countProspects,
    filters,
    hasInjected,
    injectProspects,
    isLoading,
    result: displayedResult,
    resultModalOpen,
    updateFilter,
  };
}
