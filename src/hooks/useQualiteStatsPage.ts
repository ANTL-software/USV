import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQualiteStatsView } from './useQualiteStatsView.ts';

export function useQualiteStatsPage() {
  const navigate = useNavigate();
  const stats = useQualiteStatsView();
  const navigateBack = useCallback((): void => {
    void navigate('/operations/qualite');
  }, [navigate]);

  return {
    ...stats,
    navigateBack,
  };
}

export type QualiteStatsPageViewModel = ReturnType<typeof useQualiteStatsPage>;
