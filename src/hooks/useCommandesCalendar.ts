import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { View } from 'react-big-calendar';
import { getCommandesCalendarService, searchCommandesCalendarService } from '../API/services/index.ts';
import { buildCommandesCalendarEvents, getCalendarLeadDate, getCalendarLeadLabel, getCommandesCalendarRange, getCommandesCalendarEventProps, getErrorMessage } from '../utils/scripts/index.ts';
import type { Campagne, CommandesCalendarData, CommandesCalendarEvent, CommandesCalendarLead, CommandesCalendarSearch, CommandesCalendarSnapshot, CommandesCalendarView, StatutRendezVous } from '../utils/types/index.ts';
import { STATUT_RENDEZ_VOUS_OPTIONS } from '../utils/types/index.ts';

export function useCommandesCalendar(enabled: boolean, campagnes: Campagne[], initial: CommandesCalendarSnapshot | undefined, initialCampaignId: number | undefined, onOpen: (id: number, snapshot: CommandesCalendarSnapshot) => void) {
  const [selectedCampaignId, setCampaignId] = useState<number | null | undefined>(initial?.campaignId);
  const [date, setDate] = useState(() => initial ? new Date(`${initial.date}T12:00:00`) : new Date());
  const [view, setView] = useState<CommandesCalendarView>(initial?.view ?? 'month');
  const [statut, setStatut] = useState<StatutRendezVous | ''>(initial?.statut ?? '');
  const [agentId, setAgentId] = useState<number | null>(initial?.agentId ?? null);
  const [search, setSearch] = useState(initial?.search ?? '');
  const [searchPage, setSearchPage] = useState(1);
  const [calendarResult, setCalendarResult] = useState<{ key: string; data: CommandesCalendarData | null; agents: CommandesCalendarData['agents']; error: string } | null>(null);
  const [searchResult, setSearchResult] = useState<{ key: string; data: CommandesCalendarSearch | null; error: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const campaignOptions = useMemo(() => campagnes.filter((item) => item.type_campagne === 'lead_b2b').map((item) => ({ value: String(item.id_campagne), label: item.nom_campagne })), [campagnes]);
  const campaignId = selectedCampaignId !== undefined ? selectedCampaignId : campaignOptions.some((option) => option.value === String(initialCampaignId)) ? initialCampaignId ?? null : null;
  const range = getCommandesCalendarRange(date, view);
  const calendarKey = `${campaignId}|${range.start}|${range.end}|${statut}|${agentId}`;
  const data = enabled && campaignId && calendarResult?.key === calendarKey ? calendarResult.data : null;
  const error = calendarResult?.key === calendarKey ? calendarResult.error : '';
  const loading = enabled && Boolean(campaignId) && calendarResult?.key !== calendarKey;
  useEffect(() => {
    if (!enabled || !campaignId) return;
    let cancelled = false;
    void getCommandesCalendarService({ campagne: campaignId, date_debut: range.start, date_fin: range.end, statut: statut || undefined, agent: agentId ?? undefined }).then((result) => {
      if (!cancelled) setCalendarResult({ key: calendarKey, data: result, agents: result.agents, error: '' });
    }).catch((failure: unknown) => {
      if (!cancelled) setCalendarResult((previous) => ({ key: calendarKey, data: null, agents: previous?.key.startsWith(`${campaignId}|`) ? previous.agents : [], error: getErrorMessage(failure, 'Chargement du calendrier impossible.') }));
    });
    return () => { cancelled = true; };
  }, [enabled, campaignId, range.start, range.end, statut, agentId, calendarKey, refreshKey]);
  useEffect(() => {
    if (!enabled) return;
    const refresh = (): void => { if (!document.hidden) setRefreshKey((key) => key + 1); };
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [enabled]);
  const searching = search.trim().length >= 2;
  const searchKey = `${search}|${searchPage}|${statut}|${agentId}`;
  const searchData = searching && searchResult?.key === searchKey ? searchResult.data : null;
  const searchError = searchResult?.key === searchKey ? searchResult.error : '';
  const searchLoading = searching && searchResult?.key !== searchKey;
  useEffect(() => {
    if (!enabled || !searching) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void searchCommandesCalendarService({ q: search.trim(), page: searchPage, statut: statut || undefined, agent: agentId ?? undefined }).then((result) => {
        if (!cancelled) setSearchResult({ key: searchKey, data: result, error: '' });
      }).catch((failure: unknown) => {
        if (!cancelled) setSearchResult({ key: searchKey, data: null, error: getErrorMessage(failure, 'Recherche impossible.') });
      });
    }, 300);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [enabled, searching, search, searchPage, statut, agentId, searchKey]);
  const presentation = useMemo(() => data ? buildCommandesCalendarEvents(data, range.start, range.end, view) : { events: [], backgrounds: [], dayClasses: new Map<string, string>() }, [data, range.start, range.end, view]);
  const snapshot: CommandesCalendarSnapshot = { campaignId, date: format(date, 'yyyy-MM-dd'), view, statut, agentId, search };
  const selectEvent = (event: CommandesCalendarEvent): void => { if (event.leadId) onOpen(event.leadId, snapshot); };
  const jumpToLead = (lead: CommandesCalendarLead): void => {
    setCampaignId(lead.id_campagne); setDate(getCalendarLeadDate(lead)); setView('day'); setHighlightId(lead.id_lead); setSearch(''); setSearchPage(1);
  };
  const eventPropGetter = useCallback((event: CommandesCalendarEvent) => ({ className: `${getCommandesCalendarEventProps(event).className}${event.leadId === highlightId ? ' commandesCalendar__event--highlight' : ''}` }), [highlightId]);
  const dayPropGetter = useCallback((day: Date) => ({ className: presentation.dayClasses.get(format(day, 'yyyy-MM-dd')) ?? '' }), [presentation.dayClasses]);
  const results = useMemo(() => searchData?.leads.map((lead) => ({ lead, id: lead.id_lead, label: getCalendarLeadLabel(lead), dateLabel: `${format(getCalendarLeadDate(lead), 'dd/MM/yyyy HH:mm')} · ${lead.campagne?.nom_campagne ?? ''}` })) ?? [], [searchData]);
  const agentOptions = useMemo(() => [{ value: '', label: 'Tous les commerciaux' }, ...(calendarResult?.key.startsWith(`${campaignId}|`) ? calendarResult.agents : []).map((agent) => ({ value: String(agent.id_employe), label: `${agent.prenom} ${agent.nom.toUpperCase()}` }))], [calendarResult, campaignId]);
  const changeCampaign = (id: number | null): void => { setCampaignId(id); setAgentId(null); setHighlightId(null); };
  return { scrollTime: highlightId ? date : new Date(1970, 0, 1, 8), campaignId, campaignOptions, date, view, statut, agentId, search, data, loading, error, searching, searchLoading, searchError, results, searchPage, searchPagination: searchData?.pagination,
    agentOptions, statusOptions: [{ value: '', label: 'Tous les statuts (hors annulés)' }, ...STATUT_RENDEZ_VOUS_OPTIONS],
    events: presentation.events, backgroundEvents: presentation.backgrounds, eventPropGetter, dayPropGetter, selectEvent, jumpToLead, changeCampaign,
    changeDate: (value: Date): void => { setDate(value); setHighlightId(null); },
    changeView: (value: View): void => { if (value === 'month' || value === 'week' || value === 'day') setView(value); },
    changeStatus: (value: string): void => { if (!value || STATUT_RENDEZ_VOUS_OPTIONS.some((option) => option.value === value)) { setStatut(value as StatutRendezVous | ''); setSearchPage(1); } },
    changeAgent: (value: string): void => { setAgentId(value ? Number(value) : null); setSearchPage(1); },
    changeSearch: (value: string): void => { setSearch(value); setSearchPage(1); }, setSearchPage,
    refresh: (): void => setRefreshKey((key) => key + 1),
  };
}
export type CommandesCalendarViewModel = ReturnType<typeof useCommandesCalendar>;
