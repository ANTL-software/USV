import { useMemo, useState } from 'react';
import { useEmployes } from './useEmployes.ts';
import { useQualiteProgpaStats } from './useQualiteProgpaStats.ts';
import {
  QUALITE_PERIOD_OPTIONS,
  buildQualiteCommercialOptions,
  buildQualiteDailyData,
  buildQualiteDateRange,
  buildQualiteDistributionData,
  buildQualiteMonthlyData,
  buildQualiteRankingData,
  getQualiteMonthBounds,
  getQualiteRangeLabel,
  getQualiteToday,
} from '../utils/scripts/index.ts';
import type { QualitePeriodMode } from '../utils/scripts/index.ts';

export function useQualiteStatsView() {
  const { employes, isLoading: employesLoading } = useEmployes();
  const today = useMemo(() => getQualiteToday(), []);
  const monthBounds = useMemo(() => getQualiteMonthBounds(), []);
  const [periodMode, setPeriodMode] = useState<QualitePeriodMode>('jour');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [selectedEmployeId, setSelectedEmployeId] = useState<number | null>(null);
  const [appliedFilters, setAppliedFilters] = useState({
    periodMode: 'jour' as QualitePeriodMode,
    dateDebut: today as string | null,
    dateFin: today as string | null,
    idEmploye: null as number | null,
  });
  const { data, isLoading, error, reload } = useQualiteProgpaStats(
    appliedFilters.dateDebut,
    appliedFilters.dateFin,
    appliedFilters.idEmploye,
  );

  const commercialOptions = useMemo(
    () => buildQualiteCommercialOptions(employes, data?.commerciaux || []),
    [data?.commerciaux, employes],
  );
  const rankingData = useMemo(() => buildQualiteRankingData(data?.commerciaux || []), [data?.commerciaux]);
  const distributionData = useMemo(() => buildQualiteDistributionData(data?.repartition || []), [data?.repartition]);
  const evolutionJoursData = useMemo(() => buildQualiteDailyData(data?.evolution_jours || []), [data?.evolution_jours]);
  const evolutionMoisData = useMemo(() => buildQualiteMonthlyData(data?.evolution_mois || []), [data?.evolution_mois]);

  const changePeriodMode = (value: QualitePeriodMode): void => {
    setPeriodMode(value);
    if (value === 'jour' || value === 'entre') {
      setStartDate(today);
      setEndDate(today);
    } else if (value === 'mois') {
      setStartDate(monthBounds.start);
      setEndDate(monthBounds.end);
    } else if (value === 'depuis') {
      setStartDate(today);
      setEndDate('');
    } else {
      setStartDate('');
      setEndDate(today);
    }
  };

  const applyFilters = (): void => {
    const range = buildQualiteDateRange(periodMode, startDate, endDate, today);
    setAppliedFilters({ periodMode, ...range, idEmploye: selectedEmployeId });
  };

  const resetFilters = (): void => {
    setPeriodMode('jour');
    setStartDate(today);
    setEndDate(today);
    setSelectedEmployeId(null);
    setAppliedFilters({ periodMode: 'jour', dateDebut: today, dateFin: today, idEmploye: null });
  };

  return {
    appliedFilters,
    applyFilters,
    changePeriodMode,
    commercialOptions,
    data,
    distributionData,
    employesLoading,
    endDate,
    error,
    evolutionJoursData,
    evolutionMoisData,
    isLoading,
    periodMode,
    periodeLabel: getQualiteRangeLabel(appliedFilters.periodMode, appliedFilters.dateDebut, appliedFilters.dateFin),
    periodeSummary: data?.synthese?.periode || null,
    rankingData,
    reload,
    resetFilters,
    selectedCommercial: data?.commercial || null,
    selectedEmployeId,
    selectedEmployeOption: commercialOptions.find((option) => option.value === String(selectedEmployeId ?? '')) || commercialOptions[0],
    selectedPeriodOption: QUALITE_PERIOD_OPTIONS.find((option) => option.value === periodMode) || QUALITE_PERIOD_OPTIONS[0],
    setEndDate,
    setSelectedEmployeId,
    setStartDate,
    startDate,
  };
}
