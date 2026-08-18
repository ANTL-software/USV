import { useCallback } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { readCommandesListNavigationState } from '../utils/scripts/index.ts';

export function useCommandeDetailsRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const returnState = readCommandesListNavigationState(location.state) ?? undefined;
  const navigateBack = useCallback((): void => {
    void navigate('/operations/commandes', { state: returnState });
  }, [navigate, returnState]);

  return {
    idVente: Number(id),
    isLeadMode: searchParams.get('mode') === 'lead',
    navigateBack,
  };
}
