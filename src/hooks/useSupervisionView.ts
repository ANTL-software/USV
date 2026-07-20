import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useCampagnes,
  useEmployeGraphiques,
  useGraphiques,
  useSupervision,
  useSupervisionAgents,
  useWhisper,
} from './index.ts';
import {
  buildActiveCampaignOptions,
  buildSupervisionAgentRows,
  buildSupervisionAmdKpis,
  buildSupervisionCallRows,
  buildSupervisionDialerSummary,
  buildSupervisionEmployeOptions,
  buildSupervisionExportData,
  buildSupervisionOriginSummary,
  buildSupervisionQueueItems,
  countAvailableSupervisionAgents,
  getSupervisionEmployeeLabel,
  getSupervisionQueueSummary,
  getSupervisionRuntimeSummary,
  getVisibleSupervisionAgents,
} from '../utils/scripts/index.ts';
import type { SupervisionSelectOption } from '../utils/scripts/index.ts';
import type { DateFilters } from '../utils/types/index.ts';

const INITIAL_DATE_FILTERS: DateFilters = { dateDebut: null, dateFin: null };

export function useSupervisionView() {
  const navigate = useNavigate();
  const [selectedCampagne, setSelectedCampagne] = useState<number | null>(null);
  const [selectedEmploye, setSelectedEmploye] = useState<number | null>(null);
  const [showGraphiques, setShowGraphiques] = useState(true);
  const [dateFilters, setDateFilters] = useState<DateFilters>(INITIAL_DATE_FILTERS);
  const [now, setNow] = useState(() => Date.now());

  const supervision = useSupervision(selectedCampagne);
  const supervisionAgents = useSupervisionAgents(selectedCampagne);
  const whisper = useWhisper();
  const { campagnes } = useCampagnes();
  const globalGraphsEnabled = Boolean(selectedCampagne && !selectedEmploye);
  const globalGraphiques = useGraphiques(
    globalGraphsEnabled ? selectedCampagne ?? undefined : undefined,
    globalGraphsEnabled ? dateFilters.dateDebut || undefined : undefined,
    globalGraphsEnabled ? dateFilters.dateFin || undefined : undefined,
    globalGraphsEnabled ? 60_000 : 0,
    globalGraphsEnabled,
  );
  const employeGraphiques = useEmployeGraphiques(
    selectedCampagne,
    selectedEmploye,
    dateFilters.dateDebut || undefined,
    dateFilters.dateFin || undefined,
  );

  useEffect(() => {
    if (!selectedCampagne) return;
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [selectedCampagne]);

  const campaignOptions = useMemo(
    () => buildActiveCampaignOptions(campagnes),
    [campagnes],
  );
  const employeOptions = useMemo(
    () => buildSupervisionEmployeOptions(supervisionAgents.agents),
    [supervisionAgents.agents],
  );
  const counts = useMemo(
    () => supervision.queueState?.queueCounts || [],
    [supervision.queueState],
  );
  const agents = useMemo(
    () => supervision.queueState?.agents || [],
    [supervision.queueState],
  );
  const calls = useMemo(
    () => supervision.queueState?.callsInProgress || [],
    [supervision.queueState],
  );
  const visibleAgents = useMemo(
    () => getVisibleSupervisionAgents(agents, calls),
    [agents, calls],
  );
  const displayStats = selectedEmploye ? employeGraphiques.stats : globalGraphiques.stats;
  const performanceLoading = selectedEmploye
    ? employeGraphiques.isLoading
    : globalGraphiques.isLoading;
  const selectedEmployeeLabel = useMemo(
    () => getSupervisionEmployeeLabel(supervisionAgents.agents, selectedEmploye),
    [selectedEmploye, supervisionAgents.agents],
  );

  const handleCampaignChange = useCallback((option: SupervisionSelectOption | null): void => {
    setSelectedCampagne(option ? Number(option.value) : null);
    setSelectedEmploye(null);
    setDateFilters(INITIAL_DATE_FILTERS);
  }, []);

  const handleEmployeeChange = useCallback((option: SupervisionSelectOption | null): void => {
    setSelectedEmploye(option && option.value !== 'all' ? Number(option.value) : null);
  }, []);

  const navigateBack = useCallback((): void => {
    void navigate('/operations');
  }, [navigate]);

  const toggleGraphiques = useCallback((): void => {
    setShowGraphiques((current) => !current);
  }, []);

  const handleStartWhisper = useCallback((idAppel: number, agentName: string): void => {
    void whisper.startWhisper(idAppel, agentName);
  }, [whisper]);

  const queueSummary = useMemo(() => getSupervisionQueueSummary(counts), [counts]);
  const agentRows = useMemo(
    () => buildSupervisionAgentRows(visibleAgents, now),
    [now, visibleAgents],
  );

  return {
    agentRows,
    amdKpis: useMemo(
      () => buildSupervisionAmdKpis(displayStats?.amdStats || {
        totalCalls: 0,
        qualifiedCalls: 0,
        humanCount: 0,
        sviCount: 0,
        messagingCount: 0,
        faxCount: 0,
        filteredMachineStartCount: 0,
        unknownCount: 0,
        pendingCount: 0,
        systemEndedCount: 0,
        bridgeCount: 0,
        avgBridgeDelaySeconds: 0,
        sviDurationSampleCount: 0,
        avgSviDurationSeconds: 0,
      }),
      [displayStats],
    ),
    availableAgentCount: countAvailableSupervisionAgents(visibleAgents),
    callRows: useMemo(() => buildSupervisionCallRows(calls), [calls]),
    calls,
    campaignOptions,
    counts,
    dateFilters,
    dialerSummary: useMemo(() => buildSupervisionDialerSummary(visibleAgents), [visibleAgents]),
    displayStats,
    employeOptions,
    exportData: useMemo(() => buildSupervisionExportData(
      campaignOptions,
      selectedCampagne,
      supervisionAgents.agents,
      selectedEmploye,
      dateFilters.dateDebut,
      dateFilters.dateFin,
      displayStats,
    ), [
      campaignOptions,
      dateFilters.dateDebut,
      dateFilters.dateFin,
      displayStats,
      selectedCampagne,
      selectedEmploye,
      supervisionAgents.agents,
    ]),
    handleCampaignChange,
    handleEmployeeChange,
    handleStartWhisper,
    navigateBack,
    originSummary: useMemo(() => buildSupervisionOriginSummary(calls), [calls]),
    performanceLoading,
    queueSummary,
    queueItems: useMemo(() => buildSupervisionQueueItems(counts), [counts]),
    runtimeSummary: useMemo(() => getSupervisionRuntimeSummary(visibleAgents), [visibleAgents]),
    selectedCampagne,
    selectedCampaignOption: campaignOptions.find(({ value }) => value === String(selectedCampagne)) || null,
    selectedEmploye,
    selectedEmployeeLabel,
    selectedEmployeeOption: selectedEmploye
      ? employeOptions.find(({ value }) => value === String(selectedEmploye)) || null
      : employeOptions[0] || null,
    setDateFilters,
    showGraphiques,
    supervision,
    supervisionAgents,
    toggleGraphiques,
    visibleAgentCount: visibleAgents.length,
    whisper,
  };
}

export type SupervisionViewModel = ReturnType<typeof useSupervisionView>;
