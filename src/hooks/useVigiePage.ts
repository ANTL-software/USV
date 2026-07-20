import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useVigieView } from './useVigieView.ts';

export function useVigiePage() {
  const navigate = useNavigate();
  const vigie = useVigieView();
  const navigateBack = useCallback((): void => {
    void navigate('/operations');
  }, [navigate]);
  return { navigateBack, vigie };
}

export type VigiePageViewModel = ReturnType<typeof useVigiePage>;
