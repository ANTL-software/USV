import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLeadClientDetails } from './useLeadClientDetails.ts';

export function useLeadClientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const details = useLeadClientDetails(Number(id));
  const navigateBack = useCallback((): void => {
    void navigate('/operations/commandes');
  }, [navigate]);

  return { ...details, navigateBack };
}

export type LeadClientDetailsPageViewModel = ReturnType<typeof useLeadClientDetailsPage>;
