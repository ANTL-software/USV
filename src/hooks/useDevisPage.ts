import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevisView } from './useDevisView.ts';

export function useDevisPage() {
  const navigate = useNavigate();
  const devis = useDevisView();
  const navigateBack = useCallback((): void => {
    void navigate('/commercial');
  }, [navigate]);

  return {
    ...devis,
    navigateBack,
  };
}

export type DevisPageViewModel = ReturnType<typeof useDevisPage>;
