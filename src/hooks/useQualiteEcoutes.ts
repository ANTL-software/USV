import { useCallback, useEffect, useState } from 'react';
import {
  getAllCampagnesService,
  getAllEmployesService,
  getAllRecordingsService,
  getRecordingOperationsConfigurationService,
  getRecordingStreamUrl,
  updateRecordingOperationsConfigurationService,
} from '../API/services/index.ts';
import type { Enregistrement, EnregistrementFilters, RecordingFilterOption, RecordingOperationsConfiguration } from '../utils/types/index.ts';

const PAGE_SIZE = 10;

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Une erreur est survenue lors de la récupération des écoutes';
}

export function useQualiteEcoutes() {
  const [recordings, setRecordings] = useState<Enregistrement[]>([]);
  const [agents, setAgents] = useState<RecordingFilterOption[]>([]);
  const [campaigns, setCampaigns] = useState<RecordingFilterOption[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<RecordingFilterOption | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<RecordingFilterOption | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<RecordingFilterOption | null>(null);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [telephone, setTelephone] = useState('');
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRecording, setActiveRecording] = useState<Enregistrement | null>(null);
  const [operationsConfiguration, setOperationsConfiguration] = useState<RecordingOperationsConfiguration | null>(null);
  const [isUpdatingConfiguration, setIsUpdatingConfiguration] = useState(false);

  const loadOperationsConfiguration = useCallback(async (): Promise<void> => {
    try {
      setOperationsConfiguration(await getRecordingOperationsConfigurationService());
    } catch (configurationError) {
      console.error('Erreur chargement configuration enregistrements :', configurationError);
    }
  }, []);

  useEffect(() => {
    void loadOperationsConfiguration();
    const interval = window.setInterval(() => { void loadOperationsConfiguration(); }, 30000);
    return () => window.clearInterval(interval);
  }, [loadOperationsConfiguration]);

  useEffect(() => {
    let isCancelled = false;

    const loadFilterData = async (): Promise<void> => {
      try {
        const [agentsData, campaignsData] = await Promise.all([
          getAllEmployesService(),
          getAllCampagnesService(),
        ]);

        if (isCancelled) {
          return;
        }

        setAgents([
          { value: '', label: 'Tous les agents' },
          ...agentsData.map((agent) => ({
            value: String(agent.id_employe),
            label: `${agent.prenom} ${agent.nom.toUpperCase()}`,
          })),
        ]);
        setCampaigns([
          { value: '', label: 'Toutes les campagnes' },
          ...campaignsData.map((campaign) => ({
            value: String(campaign.id_campagne),
            label: campaign.nom_campagne,
          })),
        ]);
      } catch (loadError) {
        console.error('Erreur chargement des filtres :', loadError);
      }
    };

    void loadFilterData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const fetchRecordings = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const filters: EnregistrementFilters = {
      page,
      limit: PAGE_SIZE,
      id_agent: selectedAgent?.value || undefined,
      id_campagne: selectedCampaign?.value || undefined,
      statut_appel: selectedStatus?.value || undefined,
      date_debut: dateDebut || undefined,
      date_fin: dateFin || undefined,
      numero_telephone: telephone || undefined,
      recherche: recherche || undefined,
    };

    try {
      const response = await getAllRecordingsService(filters);
      if (!response.success) {
        setError('Impossible de charger les enregistrements');
        return;
      }

      setRecordings(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalCount(response.pagination.total);
    } catch (loadError) {
      console.error('Erreur fetchRecordings :', loadError);
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [dateDebut, dateFin, page, recherche, selectedAgent, selectedCampaign, selectedStatus, telephone]);

  useEffect(() => {
    void fetchRecordings();
  }, [fetchRecordings]);

  const submitSearch = useCallback((): void => {
    setPage(1);
    void fetchRecordings();
  }, [fetchRecordings]);

  const resetFilters = useCallback((): void => {
    setSelectedAgent(null);
    setSelectedCampaign(null);
    setSelectedStatus(null);
    setDateDebut('');
    setDateFin('');
    setTelephone('');
    setRecherche('');
    setPage(1);
  }, []);

  const selectAgent = useCallback((option: RecordingFilterOption | null): void => {
    setSelectedAgent(option);
    setPage(1);
  }, []);

  const selectCampaign = useCallback((option: RecordingFilterOption | null): void => {
    setSelectedCampaign(option);
    setPage(1);
  }, []);

  const selectStatus = useCallback((option: RecordingFilterOption | null): void => {
    setSelectedStatus(option);
    setPage(1);
  }, []);

  const changeDateDebut = useCallback((value: string): void => {
    setDateDebut(value);
    setPage(1);
  }, []);

  const changeDateFin = useCallback((value: string): void => {
    setDateFin(value);
    setPage(1);
  }, []);

  const changeTelephone = useCallback((value: string): void => {
    setTelephone(value);
    setPage(1);
  }, []);

  const previousPage = useCallback((): void => {
    setPage((currentPage) => Math.max(currentPage - 1, 1));
  }, []);

  const nextPage = useCallback((): void => {
    setPage((currentPage) => Math.min(currentPage + 1, totalPages));
  }, [totalPages]);

  const updateOperationsConfiguration = useCallback(async (
    updates: { enabled?: boolean; answeringMachineEnabled?: boolean },
  ): Promise<void> => {
    setIsUpdatingConfiguration(true);
    try {
      const updated = await updateRecordingOperationsConfigurationService(updates);
      setOperationsConfiguration((current) => current ? { ...current, ...updated } : current);
    } catch (configurationError) {
      setError(getErrorMessage(configurationError));
    } finally {
      setIsUpdatingConfiguration(false);
    }
  }, []);

  const toggleRecordingEnabled = useCallback((enabled: boolean): void => {
    void updateOperationsConfiguration({ enabled });
  }, [updateOperationsConfiguration]);

  const toggleAnsweringMachineRecording = useCallback((answeringMachineEnabled: boolean): void => {
    void updateOperationsConfiguration({ answeringMachineEnabled });
  }, [updateOperationsConfiguration]);

  return {
    activeRecording,
    agents,
    campaigns,
    changeDateDebut,
    changeDateFin,
    changeTelephone,
    dateDebut,
    dateFin,
    error,
    getRecordingUrl: getRecordingStreamUrl,
    isLoading,
    isUpdatingConfiguration,
    nextPage,
    page,
    previousPage,
    recherche,
    recordings,
    operationsConfiguration,
    resetFilters,
    selectAgent,
    selectCampaign,
    selectedAgent,
    selectedCampaign,
    selectedStatus,
    selectStatus,
    setActiveRecording,
    setRecherche,
    submitSearch,
    telephone,
    toggleAnsweringMachineRecording,
    toggleRecordingEnabled,
    totalCount,
    totalPages,
  };
}
