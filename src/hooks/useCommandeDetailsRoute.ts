import { useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

export function useCommandeDetailsRoute() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigateBack = useCallback((): void => {
    void navigate('/operations/commandes');
  }, [navigate]);

  return {
    idVente: Number(id),
    isLeadMode: searchParams.get('mode') === 'lead',
    navigateBack,
  };
}
