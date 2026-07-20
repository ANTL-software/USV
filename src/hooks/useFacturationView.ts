import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useFacturation } from './useFacturation.ts';

export function useFacturationView() {
  const navigate = useNavigate();
  const facturation = useFacturation();
  const navigateBack = useCallback((): void => {
    void navigate('/commercial');
  }, [navigate]);
  return { facturation, navigateBack };
}

export type FacturationViewModel = ReturnType<typeof useFacturationView>;
