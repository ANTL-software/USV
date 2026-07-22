import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  deleteVenteService,
  getAgentsCampagneService,
  getLeadClientsService,
  restoreVenteService,
} from '../API/services/index.ts';
import { VenteContext } from '../context/vente/index.ts';
import {
  CAMPAIGN_VARIANTS,
  buildLeadCommandesSummary,
  buildSaleCommandesSummary,
  getMonthBounds,
  normalizeCampaignVariant,
} from '../utils/scripts/index.ts';
import { confirm, showError, showSuccess } from '../utils/services/index.ts';
import {
  STATUT_RENDEZ_VOUS_OPTIONS,
  STATUT_VENTE_OPTIONS,
} from '../utils/types/index.ts';
import type {
  LeadClient,
  LeadClientListParams,
  LeadClientStats,
  StatutRendezVous,
  StatutVente,
  Vente,
} from '../utils/types/index.ts';
import type { CommandesPeriodPreset } from '../utils/scripts/index.ts';
import { useCampagnes } from './useCampagnes.ts';

export interface CommandesSelectOption {
  value: string;
  label: string;
}

const DEFAULT_LEAD_STATS: LeadClientStats = {
  total: 0,
  planifies: 0,
  effectues: 0,
  annules: 0,
  reportes: 0,
  nonHonores: 0,
};

const PAGE_LIMIT = 20;

export function useCommandesList() {
  const venteContext = useContext(VenteContext);
  const { campagnes } = useCampagnes();

  if (!venteContext) {
    throw new Error('useCommandesList must be used within a VenteProvider');
  }

  const {
    ventes,
    pagination,
    isLoading,
    error,
    filters,
    setFilters,
    load,
    stats,
    resetFilters,
  } = venteContext;
  const currentMonthBounds = getMonthBounds(0);
  const previousMonthBounds = getMonthBounds(-1);

  const [localStatut, setLocalStatut] = useState<StatutVente | ''>(filters.statut ?? '');
  const [localLeadStatut, setLocalLeadStatut] = useState<StatutRendezVous | ''>('');
  const [periodPreset, setPeriodPreset] = useState<CommandesPeriodPreset>('current_month');
  const [localDateDebut, setLocalDateDebut] = useState(filters.date_debut ?? currentMonthBounds.start);
  const [localDateFin, setLocalDateFin] = useState(filters.date_fin ?? currentMonthBounds.end);
  const [localAgentId, setLocalAgentId] = useState<number | null>(filters.agent ?? null);
  const [vueMode, setVueMode] = useState<'actives' | 'corbeille'>('actives');
  const [campaignAgents, setCampaignAgents] = useState<CommandesSelectOption[]>([]);
  const [leadClients, setLeadClients] = useState<LeadClient[]>([]);
  const [leadPagination, setLeadPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [leadStats, setLeadStats] = useState<LeadClientStats>(DEFAULT_LEAD_STATS);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadFilters, setLeadFilters] = useState<LeadClientListParams>({ page: 1, limit: PAGE_LIMIT });

  const selectedCampagne = campagnes.find((campagne) => campagne.id_campagne === filters.campagne);
  const selectedVariant = selectedCampagne
    ? normalizeCampaignVariant(selectedCampagne.type_campagne)
    : null;
  const isLeadCampaign = selectedVariant === CAMPAIGN_VARIANTS.lead_b2b;
  const hasResolvedSelectedCampaign = !filters.campagne || selectedCampagne !== undefined;
  const isCorbeille = vueMode === 'corbeille';

  const loadLeadClients = useCallback(async (
    campagneId: number,
    requestFilters: LeadClientListParams,
  ): Promise<void> => {
    setLeadLoading(true);
    setLeadError(null);

    try {
      const result = await getLeadClientsService({
        campagne: campagneId,
        statut: requestFilters.statut,
        agent: requestFilters.agent,
        date_debut: requestFilters.date_debut,
        date_fin: requestFilters.date_fin,
        date_field: requestFilters.date_field,
        page: requestFilters.page,
        limit: requestFilters.limit,
      });
      setLeadClients(result.leads);
      setLeadPagination(result.pagination);
      setLeadStats(result.stats);
    } catch (loadError) {
      const message = loadError instanceof Error
        ? loadError.message
        : 'Erreur lors du chargement des rendez-vous client';
      setLeadError(message);
      setLeadClients([]);
      setLeadPagination(null);
      setLeadStats(DEFAULT_LEAD_STATS);
    } finally {
      setLeadLoading(false);
    }
  }, []);

  const handleVueModeChange = useCallback((mode: 'actives' | 'corbeille'): void => {
    setVueMode(mode);
    setFilters({
      soft_deleted: mode === 'corbeille',
      statut: undefined,
      agent: undefined,
      date_debut: currentMonthBounds.start,
      date_fin: currentMonthBounds.end,
      date_field: 'emission_or_acceptation',
      page: 1,
    });
    setPeriodPreset('current_month');
    setLocalStatut('');
    setLocalAgentId(null);
    setLocalDateDebut(currentMonthBounds.start);
    setLocalDateFin(currentMonthBounds.end);
  }, [currentMonthBounds.end, currentMonthBounds.start, setFilters]);

  const deleteVente = useCallback(async (vente: Vente): Promise<void> => {
    const confirmed = await confirm(
      `Êtes-vous sûr de vouloir supprimer la commande ${vente.reference_doc ?? `#${vente.id_vente}`} ?`,
      'Supprimer la commande',
      'Supprimer',
      'Annuler',
    );
    if (!confirmed) {
      return;
    }

    const purge = await confirm(
      "Souhaitez-vous également supprimer l'enregistrement de cette vente au niveau du commercial (CA mensuel, objectif, commission) ?\n\n- OUI (Purge totale) : Supprime définitivement la commande et la retire des statistiques du commercial.\n- NON (Suppression simple) : Retire la commande de cette vue mais la conserve pour le commercial.",
      'Niveau de suppression',
      'Oui (Purge totale)',
      'Non (Suppression simple)',
    );

    try {
      await deleteVenteService(vente.id_vente, purge);
      await load();
    } catch (deleteError) {
      console.error('Erreur lors de la suppression de la vente:', deleteError);
      await showError('Impossible de supprimer la commande.', 'Erreur');
    }
  }, [load]);

  const restoreVente = useCallback(async (vente: Vente): Promise<void> => {
    const confirmed = await confirm(
      `Souhaitez-vous restaurer la commande ${vente.reference_doc ?? `#${vente.id_vente}`} ?\n\nElle réapparaîtra dans la liste des commandes actives.`,
      'Restaurer la commande',
      'Restaurer',
      'Annuler',
    );
    if (!confirmed) {
      return;
    }

    try {
      await restoreVenteService(vente.id_vente);
      await showSuccess(
        `Commande ${vente.reference_doc ?? `#${vente.id_vente}`} restaurée avec succès.`,
        'Restauration',
      );
      await load();
    } catch (restoreError) {
      console.error('Erreur lors de la restauration de la vente:', restoreError);
      await showError('Impossible de restaurer la commande.', 'Erreur');
    }
  }, [load]);

  useEffect(() => {
    if (!filters.campagne || !hasResolvedSelectedCampaign || isLeadCampaign) {
      return;
    }

    load();
  }, [
    filters.campagne,
    filters.statut,
    filters.agent,
    filters.date_debut,
    filters.date_fin,
    filters.date_field,
    filters.page,
    filters.soft_deleted,
    hasResolvedSelectedCampaign,
    isLeadCampaign,
    load,
  ]);

  useEffect(() => {
    if (!filters.campagne || !hasResolvedSelectedCampaign || !isLeadCampaign) {
      return;
    }

    void loadLeadClients(filters.campagne, leadFilters);
  }, [filters.campagne, hasResolvedSelectedCampaign, isLeadCampaign, leadFilters, loadLeadClients]);

  useEffect(() => {
    if (isLeadCampaign && vueMode !== 'actives') {
      setVueMode('actives');
    }
  }, [isLeadCampaign, vueMode]);

  useEffect(() => {
    if (isLeadCampaign) {
      setLocalLeadStatut(leadFilters.statut ?? '');
      setLocalAgentId(leadFilters.agent ?? null);
      setLocalDateDebut(leadFilters.date_debut ?? '');
      setLocalDateFin(leadFilters.date_fin ?? '');
      return;
    }

    setLocalDateDebut(filters.date_debut ?? '');
    setLocalDateFin(filters.date_fin ?? '');
    setLocalStatut(filters.statut ?? '');
    setLocalAgentId(filters.agent ?? null);
  }, [
    filters.agent,
    filters.date_debut,
    filters.date_fin,
    filters.statut,
    isLeadCampaign,
    leadFilters.agent,
    leadFilters.date_debut,
    leadFilters.date_fin,
    leadFilters.statut,
  ]);

  useEffect(() => {
    const isCurrentMonth = localDateDebut === currentMonthBounds.start
      && localDateFin === currentMonthBounds.end;
    const isPreviousMonth = localDateDebut === previousMonthBounds.start
      && localDateFin === previousMonthBounds.end;

    if (isCurrentMonth) {
      setPeriodPreset('current_month');
      return;
    }

    if (isPreviousMonth) {
      setPeriodPreset('previous_month');
      return;
    }

    setPeriodPreset('custom');
  }, [
    currentMonthBounds.end,
    currentMonthBounds.start,
    localDateDebut,
    localDateFin,
    previousMonthBounds.end,
    previousMonthBounds.start,
  ]);

  useEffect(() => {
    if (!filters.campagne || !hasResolvedSelectedCampaign) {
      setCampaignAgents([]);
      return;
    }

    let isCancelled = false;

    const loadCampaignAgents = async (): Promise<void> => {
      try {
        const agents = await getAgentsCampagneService(filters.campagne as number);
        if (isCancelled) {
          return;
        }

        setCampaignAgents(
          agents
            .filter((entry) => entry.agent)
            .map((entry) => ({
              value: String(entry.agent?.id_employe),
              label: `${entry.agent?.prenom ?? ''} ${entry.agent?.nom ?? ''}`.trim(),
            })),
        );
      } catch {
        if (!isCancelled) {
          setCampaignAgents([]);
        }
      }
    };

    void loadCampaignAgents();

    return () => {
      isCancelled = true;
    };
  }, [filters.campagne, hasResolvedSelectedCampaign]);

  useEffect(() => {
    return () => {
      resetFilters();
      setLeadClients([]);
      setLeadPagination(null);
      setLeadStats(DEFAULT_LEAD_STATS);
    };
  }, [resetFilters]);

  const handleCampagneChange = useCallback((campagneId: number | null): void => {
    setFilters({
      campagne: campagneId ?? undefined,
      soft_deleted: false,
      statut: undefined,
      agent: undefined,
      date_debut: currentMonthBounds.start,
      date_fin: currentMonthBounds.end,
      date_field: 'emission_or_acceptation',
      page: 1,
    });
    setLeadFilters({
      page: 1,
      limit: PAGE_LIMIT,
      date_debut: currentMonthBounds.start,
      date_fin: currentMonthBounds.end,
      date_field: 'emission_or_qualification',
    });
    setLeadClients([]);
    setLeadPagination(null);
    setLeadStats(DEFAULT_LEAD_STATS);
    setLeadError(null);
    setVueMode('actives');
    setPeriodPreset('current_month');
    setLocalStatut('');
    setLocalLeadStatut('');
    setLocalAgentId(null);
    setLocalDateDebut(currentMonthBounds.start);
    setLocalDateFin(currentMonthBounds.end);
  }, [currentMonthBounds.end, currentMonthBounds.start, setFilters]);

  const handlePeriodPresetChange = useCallback((preset: CommandesPeriodPreset): void => {
    setPeriodPreset(preset);

    if (preset === 'current_month') {
      setLocalDateDebut(currentMonthBounds.start);
      setLocalDateFin(currentMonthBounds.end);
      return;
    }

    if (preset === 'previous_month') {
      setLocalDateDebut(previousMonthBounds.start);
      setLocalDateFin(previousMonthBounds.end);
    }
  }, [currentMonthBounds.end, currentMonthBounds.start, previousMonthBounds.end, previousMonthBounds.start]);

  const handlePageChange = useCallback((newPage: number): void => {
    if (isLeadCampaign) {
      setLeadFilters((previous) => ({ ...previous, page: newPage }));
      return;
    }

    setFilters({ page: newPage });
  }, [isLeadCampaign, setFilters]);

  const hasCampaignSelection = Boolean(filters.campagne);

  useEffect(() => {
    if (!hasCampaignSelection) {
      return;
    }

    if (isLeadCampaign) {
      setLeadFilters((previous) => {
        const nextFilters: LeadClientListParams = {
          ...previous,
          statut: localLeadStatut || undefined,
          agent: localAgentId ?? undefined,
          date_debut: localDateDebut || undefined,
          date_fin: localDateFin || undefined,
          date_field: 'emission_or_qualification',
          page: 1,
        };

        if (
          previous.statut === nextFilters.statut
          && previous.agent === nextFilters.agent
          && previous.date_debut === nextFilters.date_debut
          && previous.date_fin === nextFilters.date_fin
          && previous.date_field === nextFilters.date_field
          && previous.page === nextFilters.page
        ) {
          return previous;
        }

        return nextFilters;
      });
      return;
    }

    setFilters({
      statut: isCorbeille ? undefined : (localStatut || undefined),
      agent: localAgentId ?? undefined,
      date_debut: localDateDebut || undefined,
      date_fin: localDateFin || undefined,
      date_field: 'emission_or_acceptation',
      soft_deleted: isCorbeille,
      page: 1,
    });
  }, [
    hasCampaignSelection,
    isCorbeille,
    isLeadCampaign,
    localAgentId,
    localDateDebut,
    localDateFin,
    localLeadStatut,
    localStatut,
    setFilters,
  ]);

  const campagneOptions: CommandesSelectOption[] = campagnes.map((campagne) => ({
    value: String(campagne.id_campagne),
    label: campagne.nom_campagne,
  }));
  const statutVenteOptions: CommandesSelectOption[] = [
    { value: '', label: 'Tous les statuts' },
    ...STATUT_VENTE_OPTIONS,
  ];
  const statutLeadOptions: CommandesSelectOption[] = [
    { value: '', label: 'Tous les statuts' },
    ...STATUT_RENDEZ_VOUS_OPTIONS,
  ];
  const agentOptions: CommandesSelectOption[] = [
    { value: '', label: 'Tous les commerciaux' },
    ...campaignAgents,
  ];
  const statsValideesCount = stats?.validations?.count ?? 0;
  const statsValideesAmount = stats?.validations?.total_montant ?? 0;
  const statsEnAttenteCount = stats?.enAttente.count ?? 0;
  const statsEnAttenteAmount = stats?.enAttente.total_montant ?? 0;
  const statsAnnuleesCount = stats?.annulees.count ?? 0;
  const statsAnnuleesAmount = stats?.annulees.total_montant ?? 0;
  const statsFrigoCount = stats?.frigo.count ?? 0;
  const statsFrigoAmount = stats?.frigo.total_montant ?? 0;
  const totalVentesCount = stats?.total.count ?? 0;
  const averageValidatedAmount = statsValideesCount > 0
    ? statsValideesAmount / statsValideesCount
    : 0;
  const leadSummaryCards = useMemo(() => buildLeadCommandesSummary(leadStats), [leadStats]);
  const saleSummaryCards = useMemo(() => buildSaleCommandesSummary({
    totalCount: totalVentesCount,
    averageValidatedAmount,
    validatedAmount: statsValideesAmount,
    validatedCount: statsValideesCount,
    pendingAmount: statsEnAttenteAmount,
    pendingCount: statsEnAttenteCount,
    cancelledAmount: statsAnnuleesAmount,
    cancelledCount: statsAnnuleesCount,
    suspendedAmount: statsFrigoAmount,
    suspendedCount: statsFrigoCount,
  }), [averageValidatedAmount, statsAnnuleesAmount, statsAnnuleesCount, statsEnAttenteAmount, statsEnAttenteCount, statsFrigoAmount, statsFrigoCount, statsValideesAmount, statsValideesCount, totalVentesCount]);

  return {
    agentOptions,
    averageValidatedAmount,
    campagneOptions,
    deleteVente,
    filters,
    handleCampagneChange,
    handlePageChange,
    handlePeriodPresetChange,
    handleVueModeChange,
    hasCampaignSelection,
    isCorbeille,
    isLeadCampaign,
    leadClients,
    leadPage: leadFilters.page ?? 1,
    leadPagination,
    leadStats,
    leadSummaryCards,
    localAgentId,
    localDateDebut,
    localDateFin,
    localLeadStatut,
    localStatut,
    pageError: isLeadCampaign ? leadError : error,
    pageLoading: isLeadCampaign ? leadLoading : isLoading,
    pagination,
    periodPreset,
    restoreVente,
    salePage: filters.page ?? 1,
    saleSummaryCards,
    setLocalAgentId,
    setLocalDateDebut,
    setLocalDateFin,
    setLocalLeadStatut,
    setLocalStatut,
    setPeriodPreset,
    statsAnnuleesAmount,
    statsAnnuleesCount,
    statsEnAttenteAmount,
    statsEnAttenteCount,
    statsFrigoAmount,
    statsFrigoCount,
    statsValideesAmount,
    statsValideesCount,
    statutLeadOptions,
    statutVenteOptions,
    totalVentesCount,
    ventes,
    vueMode,
  };
}

export type CommandesListState = ReturnType<typeof useCommandesList>;
