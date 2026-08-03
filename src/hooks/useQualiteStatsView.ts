import { useMemo, useState } from 'react';
import { useCampagnes } from './useCampagnes.ts';
import { useEmployes } from './useEmployes.ts';
import { useQualiteProgpaStats } from './useQualiteProgpaStats.ts';
import {
  QUALITE_PERIOD_OPTIONS,
  buildQualiteCampaignOptions,
  buildQualiteCommercialData,
  buildQualiteCommercialOptions,
  buildQualiteDailyData,
  buildQualiteDistributionData,
  getQualitePresetRange,
  getQualiteRangeLabel,
} from '../utils/scripts/index.ts';
import type { QualitePeriodPreset } from '../utils/scripts/index.ts';

interface AppliedQualiteFilters {
  idCampagne: number | null;
  idEmploye: number | null;
  dateDebut: string;
  dateFin: string;
}

export function useQualiteStatsView() {
  const { campagnes, isLoading: campagnesLoading } = useCampagnes();
  const { employes, isLoading: employesLoading } = useEmployes();
  const defaultRange = useMemo(() => getQualitePresetRange('today'), []);
  const [periodPreset, setPeriodPreset] = useState<QualitePeriodPreset>('today');
  const [dateDebut, setDateDebutState] = useState(defaultRange.dateDebut);
  const [dateFin, setDateFinState] = useState(defaultRange.dateFin);
  const [selectedCampagneId, setSelectedCampagneId] = useState<number | null>(null);
  const [selectedEmployeId, setSelectedEmployeId] = useState<number | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<AppliedQualiteFilters>({
    idCampagne: null,
    idEmploye: null,
    ...defaultRange,
  });

  const campaignOptions = useMemo(() => buildQualiteCampaignOptions(campagnes), [campagnes]);
  const defaultCampaignId = campaignOptions[0] ? Number(campaignOptions[0].value) : null;
  const draftCampaignId = selectedCampagneId ?? defaultCampaignId;
  const requestedCampaignId = appliedFilters.idCampagne ?? defaultCampaignId;

  const { data, isLoading, error, reload } = useQualiteProgpaStats(
    requestedCampaignId,
    appliedFilters.dateDebut,
    appliedFilters.dateFin,
    appliedFilters.idEmploye,
  );

  const commercialOptions = useMemo(
    () => buildQualiteCommercialOptions(employes, data?.par_commercial || []),
    [data?.par_commercial, employes],
  );
  const distributionData = useMemo(
    () => buildQualiteDistributionData(data?.etapes || [], data?.suivi_en_cours),
    [data?.etapes, data?.suivi_en_cours],
  );
  const dailyData = useMemo(() => buildQualiteDailyData(data?.par_jour || []), [data?.par_jour]);
  const commercialData = useMemo(() => buildQualiteCommercialData(data?.par_commercial || []), [data?.par_commercial]);

  const changePeriodPreset = (value: QualitePeriodPreset): void => {
    setPeriodPreset(value);
    if (value === 'custom') return;
    const range = getQualitePresetRange(value);
    setDateDebutState(range.dateDebut);
    setDateFinState(range.dateFin);
  };

  const setDateDebut = (value: string): void => {
    setDateDebutState(value);
    setPeriodPreset('custom');
  };

  const setDateFin = (value: string): void => {
    setDateFinState(value);
    setPeriodPreset('custom');
  };

  const applyFilters = (): void => {
    if (!draftCampaignId) {
      setFilterError('Sélectionnez une campagne.');
      return;
    }
    if (!dateDebut || !dateFin || dateDebut > dateFin) {
      setFilterError('La période sélectionnée est invalide.');
      return;
    }
    setFilterError(null);
    setAppliedFilters({
      idCampagne: draftCampaignId,
      idEmploye: selectedEmployeId,
      dateDebut,
      dateFin,
    });
  };

  const resetFilters = (): void => {
    const range = getQualitePresetRange('today');
    setPeriodPreset('today');
    setDateDebutState(range.dateDebut);
    setDateFinState(range.dateFin);
    setSelectedCampagneId(null);
    setSelectedEmployeId(null);
    setFilterError(null);
    setAppliedFilters({ idCampagne: defaultCampaignId, idEmploye: null, ...range });
  };

  return {
    appliedFilters,
    applyFilters,
    campaignOptions,
    campagnesLoading,
    changePeriodPreset,
    commercialData,
    commercialOptions,
    dailyData,
    data,
    dateDebut,
    dateFin,
    distributionData,
    employesLoading,
    error,
    filterError,
    isLoading,
    periodeLabel: getQualiteRangeLabel(appliedFilters.dateDebut, appliedFilters.dateFin),
    periodPreset,
    reload,
    resetFilters,
    selectedCampaignOption: campaignOptions.find((option) => option.value === String(draftCampaignId)) || null,
    selectedCampagneId: draftCampaignId,
    selectedCommercialOption: commercialOptions.find((option) => option.value === String(selectedEmployeId ?? '')) || commercialOptions[0],
    selectedEmployeId,
    selectedPeriodOption: QUALITE_PERIOD_OPTIONS.find((option) => option.value === periodPreset) || QUALITE_PERIOD_OPTIONS[0],
    setDateDebut,
    setDateFin,
    setSelectedCampagneId,
    setSelectedEmployeId,
  };
}
