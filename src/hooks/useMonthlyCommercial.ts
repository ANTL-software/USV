import { useMonthlyPrimeAdjustments } from './useMonthlyPrimeAdjustments.ts';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMonthlyCommercialsService, getMonthlyCommercialStatsService } from '../API/services/index.ts';
import { getMonthlyCommercialMonth, isMonthlyCommercialMonthValid, formatMonthlyCommercialMonth } from '../utils/scripts/index.ts';
import type { CommercialActivityFilter, MonthlyCommercial, MonthlyCommercialStats, MonthlyCommercialCampaign, MonthlyCommercialPeriodPreset } from '../utils/types/index.ts';

export function useMonthlyCommercial() {
  const navigate = useNavigate();
  const [directoryResult, setDirectoryResult] = useState<{ revision: number; data: MonthlyCommercial[]; error: string | null } | null>(null);
  const [activity, setActivity] = useState<CommercialActivityFilter>('active');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [directoryRevision, setDirectoryRevision] = useState(0);
  const [result, setResult] = useState<{ key: string; data: MonthlyCommercialStats | null; error: string | null } | null>(null);
  const [statsRevision, setStatsRevision] = useState(0);
  const [selectedStatsCampaignId, setSelectedStatsCampaignId] = useState('all');
  const [campaigns, setCampaigns] = useState<MonthlyCommercialCampaign[]>([]);
  const [periodPreset, setPeriodPreset] = useState<MonthlyCommercialPeriodPreset>('current');
  const [month, setMonth] = useState(() => getMonthlyCommercialMonth('current'));
  const currentMonth = getMonthlyCommercialMonth('current');
  const periodError = isMonthlyCommercialMonthValid(month, currentMonth) ? null : 'Choisissez un mois valide, antérieur ou égal au mois en cours.';

  useEffect(() => {
    let active = true;
    getMonthlyCommercialsService().then((data) => {
      if (active) setDirectoryResult({ revision: directoryRevision, data, error: null });
    }).catch((error: unknown) => {
      if (active) setDirectoryResult({ revision: directoryRevision, data: [], error: error instanceof Error ? error.message : 'Impossible de charger les commerciaux' });
    });
    return () => { active = false; };
  }, [directoryRevision]);

  const commercials = directoryResult?.data ?? [];
  const directoryLoading = directoryResult?.revision !== directoryRevision;
  const directoryError = directoryResult?.revision === directoryRevision ? directoryResult.error : null;
  const visibleCommercials = commercials.filter((commercial) => activity === 'all' || commercial.actif === (activity === 'active'));
  const selectedCommercial = visibleCommercials.find(({ id_employe }) => id_employe === selectedId) ?? null;
  const effectiveId = selectedCommercial?.id_employe ?? null;
  const requestKey = `${effectiveId}:${month}:${selectedStatsCampaignId}:${statsRevision}`;
  const primeStats = result?.key === requestKey ? result.data : null;
  const primeStatsError = result?.key === requestKey ? result.error : null;
  const isPrimeStatsLoading = effectiveId !== null && !periodError && result?.key !== requestKey;
  useEffect(() => {
    let active = true;
    if (effectiveId === null || periodError) return;
    getMonthlyCommercialStatsService(effectiveId, month, selectedStatsCampaignId).then((stats) => {
      if (active) {
        setResult({ key: requestKey, data: stats, error: null });
        setCampaigns(stats.campagnes);
      }
    }).catch((error: unknown) => {
      if (active) setResult({ key: requestKey, data: null, error: error instanceof Error ? error.message : 'Impossible de charger le suivi mensuel' });
    });
    return () => { active = false; };
  }, [effectiveId, month, selectedStatsCampaignId, requestKey, periodError, statsRevision]);

  const changePeriodPreset = (value: MonthlyCommercialPeriodPreset) => {
    setPeriodPreset(value);
    if (value !== 'custom') setMonth(getMonthlyCommercialMonth(value));
  };
  const selectedYear = month.slice(0, 4);
  const selectedMonthNumber = month.slice(5, 7);
  const yearOptions = Array.from({ length: Number(currentMonth.slice(0, 4)) - 1999 }, (_, index) => {
    const value = String(Number(currentMonth.slice(0, 4)) - index);
    return { value, label: value };
  });
  const monthOptions = Array.from({ length: 12 }, (_, index) => {
    const value = String(index + 1).padStart(2, '0');
    const label = new Intl.DateTimeFormat('fr-FR', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, index, 1)));
    return { value, label: label.charAt(0).toUpperCase() + label.slice(1), isDisabled: `${selectedYear}-${value}` > currentMonth };
  });
  const selectMonthNumber = (value: string) => {
    const next = `${selectedYear}-${value}`;
    if (isMonthlyCommercialMonthValid(next, currentMonth)) setMonth(next);
  };
  const selectYear = (value: string) => {
    const next = `${value}-${selectedMonthNumber}`;
    if (isMonthlyCommercialMonthValid(next, currentMonth)) setMonth(next);
    else if (value === currentMonth.slice(0, 4)) setMonth(currentMonth);
  };
  const selectActivity = (value: CommercialActivityFilter) => {
    setActivity(value);
    if (!commercials.some(({ id_employe, actif }) => id_employe === selectedId && (value === 'all' || actif === (value === 'active')))) setSelectedId(null);
  };
  const selectCommercial = (value: number | null) => {
    setResult(null);
    setCampaigns([]);
    setSelectedId(value);
    setSelectedStatsCampaignId('all');
  };
  const statsCampaignOptions = [
    { value: 'all', label: 'Toutes les campagnes' },
    ...campaigns.map(({ id_campagne, nom_campagne }) => ({ value: String(id_campagne), label: nom_campagne })),
  ];
  const refreshStats = useCallback(() => setStatsRevision(value => value + 1), []);
  const adjustments = useMonthlyPrimeAdjustments(effectiveId, month, Boolean(primeStats?.cloture?.frozen), refreshStats);
  return {
    adjustments, activity, selectActivity, selectedCommercial, selectCommercial, directoryLoading, directoryError,
    activityOptions: [{ value: 'active' as const, label: 'Actifs' }, { value: 'inactive' as const, label: 'Inactifs' }, { value: 'all' as const, label: 'Tous' }],
    commercialOptions: visibleCommercials.map(({ id_employe, nom, prenom }) => ({ value: id_employe, label: `${prenom} ${nom}`.trim() })),
    primeStats, isPrimeStatsLoading, primeStatsError, selectedStatsCampaignId, setSelectedStatsCampaignId, statsCampaignOptions,
    selectedProgpaStats: primeStats?.progpa_stats ?? null,
    periodPreset, changePeriodPreset, periodError,
    monthOptions, yearOptions, selectedMonthNumber, selectedYear, selectMonthNumber, selectYear,
    periodLabel: formatMonthlyCommercialMonth(month),
    periodOptions: [{ value: 'current' as const, label: 'Mois en cours' }, { value: 'previous' as const, label: 'Mois précédent' }, { value: 'custom' as const, label: 'Choisir un mois et une année' }],
    selectedCampaignLabel: statsCampaignOptions.find(({ value }) => value === selectedStatsCampaignId)?.label ?? 'Toutes les campagnes',
    retryDirectory: () => setDirectoryRevision((value) => value + 1),
    retryStats: () => setStatsRevision((value) => value + 1),
    navigateBack: () => void navigate('/operations/statistiques'),
  };
}
export type MonthlyCommercialViewModel = ReturnType<typeof useMonthlyCommercial>;
