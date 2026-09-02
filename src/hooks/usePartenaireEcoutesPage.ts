import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQualiteEcoutes } from './useQualiteEcoutes.ts';

export function usePartenaireEcoutesPage() {
  const navigate = useNavigate();
  const state = useQualiteEcoutes('partenaire');
  const navigateBack = useCallback((): void => {
    void navigate('/partenaire');
  }, [navigate]);

  return { ...state, navigateBack };
}

export type PartenaireEcoutesPageViewModel = ReturnType<typeof usePartenaireEcoutesPage>;
