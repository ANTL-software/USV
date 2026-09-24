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
          const campaignData = campagne.toJSON();
          setLoadedCampagneNom(campaignData.nom_campagne);
          const defaultPostcode = campaignData.code_postal_centre_prospection
            || campaignData.code_postal_maison_mere
            || undefined;
          if (defaultPostcode) {
            setFilters((currentFilters) => (
              currentFilters.code_postal
                ? currentFilters
                : { ...currentFilters, code_postal: defaultPostcode }
            ));
          }
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
  }, [campagneId, setFilters]);

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

    const radius = filters.rayon_km ?? 150;
    if (!Number.isInteger(radius) || radius < 1 || radius > 150) {
      void showError('Le rayon doit être compris entre 1 et 150 km.');
      return false;
    }

    if (
      filters.effectif_min !== undefined
      && filters.effectif_max !== undefined
      && filters.effectif_min > filters.effectif_max
    ) {
      void showError("L'effectif minimum ne peut pas dépasser l'effectif maximum.");
      return false;
    }

    return true;
  }, [filters.code_postal, filters.effectif_max, filters.effectif_min, filters.rayon_km, showError]);

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

  const updateFilter = useCallback(<Key extends keyof InjectionFilters>(
    key: Key,
    value: InjectionFilters[Key],
  ): void => {
    setFilters({ ...filters, [key]: value });
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
    setFilters,
    updateFilter,
  };
}
