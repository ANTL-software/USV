import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { monthlyComparisonService } from '../API/services/index.ts';
import { comparisonCards, comparisonCsv, comparisonGroups, comparisonPeriodLabel, comparisonSignals, defaultComparisonMonths, defaultComparisonCampaign } from '../API/models/index.ts';
import type { ComparisonFilters, ComparisonOptions, MonthlyComparison } from '../utils/types/index.ts';

export function useMonthlyComparison() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const defaults = useMemo(() => defaultComparisonMonths(), []);
  const [defaultYear, defaultMonth] = defaults.month.split('-').map(Number);
  const maxDate = new Date(Date.UTC(defaultYear, defaultMonth, 0)).toISOString().slice(0, 10);
  const initial = useRef(params);
  const [options, setOptions] = useState<ComparisonOptions | null>(null);
  const [draft, setDraft] = useState<ComparisonFilters>({ campaign: Number(params.get('campagne')) || 0, agent: Number(params.get('agent')) || null,
    month: params.get('mois') || defaults.month, reference: params.get('reference') || defaults.reference, mode: params.get('mode') === 'full' ? 'full' : 'aligned' });
  const [applied, setApplied] = useState<ComparisonFilters | null>(null);
  const [data, setData] = useState<MonthlyComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [group, setGroup] = useState('overview');
  const [sectionSearch, setSectionSearch] = useState('');
  const [monthDate, setMonthDate] = useState(`${draft.month}-01`);
  const [referenceDate, setReferenceDate] = useState(`${draft.reference}-01`);

  useEffect(() => {
    let active = true;
    monthlyComparisonService.options().then((result) => {
      if (!active) return;
      setOptions(result);
      const campaign = defaultComparisonCampaign(result.campaigns, Number(initial.current.get('campagne')) || undefined);
      setDraft((previous) => {
        const next = { ...previous, campaign };
        return next;
      });
      if (!campaign) { setLoading(false); return; }
      const month = initial.current.get('mois') || defaults.month;
      const reference = initial.current.get('reference') || defaults.reference;
      const agent = Number(initial.current.get('agent')) || null;
      const mode = initial.current.get('mode') === 'full' ? 'full' : 'aligned';
      setApplied({ campaign, agent, month, reference, mode });
    }).catch(() => { if (active) { setError('Impossible de charger les campagnes. Vérifiez votre accès au comparatif.'); setLoading(false); } });
    return () => { active = false; };
  }, [defaults, revision]);

  useEffect(() => {
    if (!applied) return;
    let active = true;
    setLoading(true); setError(null); setData(null);
    monthlyComparisonService.report(applied).then((report) => { if (active) setData(report); })
      .catch(() => { if (active) setError('Le rapport n’a pas pu être chargé. Vérifiez les mois sélectionnés, puis réessayez.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applied]);

  const apply = () => {
    if (!draft.campaign || ![draft.month, draft.reference].every((value) => /^20\d{2}-(0[1-9]|1[0-2])$/.test(value) && value <= defaults.month)) {
      setFilterError('Sélectionnez une campagne et deux mois valides, non futurs.'); return;
    }
    setFilterError(null);
    setApplied({ ...draft });
    setParams({ campagne: String(draft.campaign), ...(draft.agent ? { agent: String(draft.agent) } : {}), mois: draft.month, reference: draft.reference, mode: draft.mode }, { replace: true });
  };
  const selectedGroup = comparisonGroups.find((item) => item.id === group) ?? comparisonGroups[0];
  const visibleSections = data?.sections.filter((section) => sectionSearch
    ? `${section.title} ${section.description}`.toLocaleLowerCase('fr').includes(sectionSearch.toLocaleLowerCase('fr'))
    : selectedGroup.sections.includes(section.id)) ?? [];
  return {
    options, draft, data, loading, error, filterError, group, groups: comparisonGroups, setGroup, sectionSearch, setSectionSearch,
    visibleSections, cards: data ? comparisonCards(data) : [], signals: data ? comparisonSignals(data) : [],
    currentLabel: data ? comparisonPeriodLabel(data.periods.current) : '', referenceLabel: data ? comparisonPeriodLabel(data.periods.reference) : '',
    generatedLabel: data ? new Date(data.generatedAt).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }) : '',
    agents: options?.agents.filter((agent) => agent.campaigns.includes(draft.campaign)) ?? [],
    maxMonth: defaults.month, maxDate, monthDate, referenceDate, emptyDays: data?.periods.current.days === 0,
    metricCount: data?.sections.reduce((count, section) => count + section.metrics.length, 0) ?? 0,
    changeCampaign: (value: string) => setDraft((previous) => ({ ...previous, campaign: Number(value), agent: null })),
    changeAgent: (value: string) => setDraft((previous) => ({ ...previous, agent: Number(value) || null })),
    changeMonth: (value: string) => { setMonthDate(value); setDraft((previous) => ({ ...previous, month: value.slice(0, 7) })); },
    changeReference: (value: string) => { setReferenceDate(value); setDraft((previous) => ({ ...previous, reference: value.slice(0, 7) })); },
    changeMode: (value: string) => setDraft((previous) => ({ ...previous, mode: value === 'full' ? 'full' : 'aligned' })),
    swap: () => { setMonthDate(referenceDate); setReferenceDate(monthDate); setDraft((previous) => ({ ...previous, month: previous.reference, reference: previous.month })); },
    apply, retry: () => options ? setApplied((previous) => previous ? { ...previous } : null) : setRevision((value) => value + 1),
    navigateBack: () => void navigate('/operations/qualite'),
    exportAll: () => { if (data) monthlyComparisonService.downloadCsv(comparisonCsv(data), `comparatif-${data.campaign.id}-${data.periods.current.month}-${data.periods.reference.month}.csv`); },
  };
}
