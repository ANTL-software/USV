import { useCallback, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  createCommandesListNavigationState,
  readCommandesListNavigationState,
} from '../utils/scripts/index.ts';

import { useCommandesList } from './useCommandesList.ts';
import { useCommandesCalendar } from './useCommandesCalendar.ts';
import type { CommandesCalendarSnapshot } from '../utils/types/index.ts';

export function useCommandesListView() {
  const navigate = useNavigate();
  const location = useLocation();
  const restoredSnapshot = useMemo(
    () => readCommandesListNavigationState(location.state)?.commandesList ?? null,
    [location.state],
  );
  const [activeTab, setActiveTab] = useState<'commandes' | 'calendar'>(restoredSnapshot?.calendar ? 'calendar' : 'commandes');
  const commandes = useCommandesList(restoredSnapshot, activeTab === 'commandes');
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
  const openCalendarLead = useCallback((id: number, calendar: CommandesCalendarSnapshot): void => {
    if (!calendar.campaignId) return;
    void navigate(`/operations/commandes/details/${id}?mode=lead`, { state: { commandesList: { ...(navigationState?.commandesList ?? { campagneId: calendar.campaignId, agentId: null, dateDebut: '', dateFin: '', leadStatus: '', page: 1, periodPreset: 'current_month', saleStatus: '', vueMode: 'actives' }), calendar } } });
  }, [navigate, navigationState]);
  const calendar = useCommandesCalendar(activeTab === 'calendar', commandes.campagnes, restoredSnapshot?.calendar, commandes.filters.campagne, openCalendarLead);
  const handleTabKey = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 'commandes' : event.key === 'End' ? 'calendar' : activeTab === 'commandes' ? 'calendar' : 'commandes';
    setActiveTab(next);
    document.getElementById(next === 'calendar' ? 'calendar-tab' : 'commandes-tab')?.focus();
  };
  return { handleTabKey, commandes, calendar, activeTab, setActiveTab, navigateBack, navigateToLead, navigateToSale };
}

export type CommandesListViewModel = ReturnType<typeof useCommandesListView>;
