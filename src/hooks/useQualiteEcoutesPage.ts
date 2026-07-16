import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQualiteEcoutes } from './useQualiteEcoutes.ts';

export function useQualiteEcoutesPage() {
  const navigate = useNavigate();
  const state = useQualiteEcoutes();
  const navigateBack = useCallback((): void => {
    void navigate('/operations/qualite');
  }, [navigate]);

  return { ...state, navigateBack };
}

export type QualiteEcoutesPageViewModel = ReturnType<typeof useQualiteEcoutesPage>;
