import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  createCommandesListNavigationState,
  readCommandesListNavigationState,
} from '../utils/scripts/index.ts';

import { useCommandesList } from './useCommandesList.ts';

export function useCommandesListView() {
  const navigate = useNavigate();
  const location = useLocation();
  const restoredSnapshot = useMemo(
    () => readCommandesListNavigationState(location.state)?.commandesList ?? null,
    [location.state],
  );
  const commandes = useCommandesList(restoredSnapshot);
  const navigationState = useMemo(() => {
    const campagneId = commandes.filters.campagne;
    if (!campagneId) {
      return undefined;
    }

    return createCommandesListNavigationState({
      agentId: commandes.localAgentId,
      campagneId,
      dateDebut: commandes.localDateDebut,
      dateFin: commandes.localDateFin,
      leadStatus: commandes.localLeadStatut,
      page: commandes.isLeadCampaign ? commandes.leadPage : commandes.salePage,
      periodPreset: commandes.periodPreset,
      saleStatus: commandes.localStatut,
      vueMode: commandes.vueMode,
    });
  }, [
    commandes.filters.campagne,
    commandes.isLeadCampaign,
    commandes.leadPage,
    commandes.localAgentId,
    commandes.localDateDebut,
    commandes.localDateFin,
    commandes.localLeadStatut,
    commandes.localStatut,
    commandes.periodPreset,
    commandes.salePage,
    commandes.vueMode,
  ]);
  const navigateBack = useCallback((): void => { void navigate('/operations'); }, [navigate]);
  const navigateToSale = useCallback((id: number): void => {
    void navigate(`/operations/commandes/details/${id}`, { state: navigationState });
  }, [navigate, navigationState]);
  const navigateToLead = useCallback((id: number): void => {
    void navigate(`/operations/commandes/details/${id}?mode=lead`, { state: navigationState });
  }, [navigate, navigationState]);
  return { commandes, navigateBack, navigateToLead, navigateToSale };
}

export type CommandesListViewModel = ReturnType<typeof useCommandesListView>;
