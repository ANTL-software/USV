import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Prospect } from '../utils/types/index.ts';
import { buildProspectCampagneOptions, parseProspectPageJump } from '../utils/scripts/index.ts';
import { useCampagnes } from './useCampagnes.ts';
import { useProspects } from './useProspects.ts';
import { useProspectDetailView } from './useProspectDetailView.ts';

export function useProspectsViewPage() {
  const navigate = useNavigate();
  const { campagnes } = useCampagnes();
  const prospectsState = useProspects(campagnes);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [jumpToPage, setJumpToPage] = useState('');
  const [queueRefreshKey, setQueueRefreshKey] = useState(0);
  const campagneOptions = useMemo(() => buildProspectCampagneOptions(campagnes), [campagnes]);
  const selectedCampagneOption = useMemo(
    () => campagneOptions.find(({ value }) => value === prospectsState.selectedCampagne) ?? campagneOptions[0],
    [campagneOptions, prospectsState.selectedCampagne],
  );

  const navigateBack = useCallback((): void => { void navigate('/operations'); }, [navigate]);
  const navigateToEnrichment = useCallback((): void => { void navigate('/operations/prospects/enrichissement'); }, [navigate]);
  const navigateToInjection = useCallback((): void => {
    if (prospectsState.selectedCampagne) void navigate(`/operations/prospect/${prospectsState.selectedCampagne.id_campagne}/inject`);
  }, [navigate, prospectsState.selectedCampagne]);
  const refreshAll = useCallback((): void => {
    prospectsState.refresh();
    setQueueRefreshKey((previous) => previous + 1);
  }, [prospectsState]);
  const closeProspectDetail = useCallback((): void => setSelectedProspect(null), []);
  const handleProspectUpdated = useCallback((updatedProspect: Prospect): void => {
    setSelectedProspect(updatedProspect);
    refreshAll();
  }, [refreshAll]);
  const prospectDetail = useProspectDetailView(selectedProspect, closeProspectDetail, handleProspectUpdated);
  const purgeCampaign = useCallback(async (): Promise<void> => {
    if (await prospectsState.purgeSelectedCampagne()) setQueueRefreshKey((previous) => previous + 1);
  }, [prospectsState]);
  const previousPage = useCallback((): void => {
    if (prospectsState.pagination && prospectsState.currentPage > 1) prospectsState.setCurrentPage(prospectsState.currentPage - 1);
  }, [prospectsState]);
  const nextPage = useCallback((): void => {
    if (prospectsState.pagination && prospectsState.currentPage < prospectsState.pagination.totalPages) prospectsState.setCurrentPage(prospectsState.currentPage + 1);
  }, [prospectsState]);
  const applyPageJump = useCallback((): void => {
    if (!prospectsState.pagination) return;
    const page = parseProspectPageJump(jumpToPage, prospectsState.pagination.totalPages);
    if (page) {
      prospectsState.setCurrentPage(page);
      setJumpToPage('');
    }
  }, [jumpToPage, prospectsState]);

  return {
    ...prospectsState,
    applyPageJump,
    campagneOptions,
    jumpToPage,
    navigateBack,
    navigateToEnrichment,
    navigateToInjection,
    nextPage,
    previousPage,
    prospectDetail,
    purgeCampaign,
    queueRefreshKey,
    refreshAll,
    selectedCampagneOption,
    selectedProspect,
    setJumpToPage,
    setSelectedProspect,
  };
}

export type ProspectsViewPageViewModel = ReturnType<typeof useProspectsViewPage>;
