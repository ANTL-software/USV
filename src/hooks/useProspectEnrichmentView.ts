import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProspectEnrichment } from './useProspectEnrichment.ts';

export function useProspectEnrichmentView() {
  const navigate = useNavigate();
  const enrichment = useProspectEnrichment();
  const navigateBack = useCallback((): void => {
    navigate('/operations/prospects');
  }, [navigate]);

  return {
    ...enrichment,
    navigateBack,
  };
}

export type ProspectEnrichmentViewModel = ReturnType<typeof useProspectEnrichmentView>;
