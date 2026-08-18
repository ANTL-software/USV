import { useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { readCommandesListNavigationState } from '../utils/scripts/index.ts';
import { useLeadClientDetails } from './useLeadClientDetails.ts';

export function useLeadClientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const details = useLeadClientDetails(Number(id));
  const returnState = readCommandesListNavigationState(location.state) ?? undefined;
  const navigateBack = useCallback((): void => {
    void navigate('/operations/commandes', { state: returnState });
  }, [navigate, returnState]);

  return { ...details, navigateBack };
}

export type LeadClientDetailsPageViewModel = ReturnType<typeof useLeadClientDetailsPage>;
