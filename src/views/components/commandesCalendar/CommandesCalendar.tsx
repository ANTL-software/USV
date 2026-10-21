import 'react-big-calendar/lib/css/react-big-calendar.css';
import './commandesCalendar.scss';
import type { ReactElement } from 'react';
import { Calendar } from 'react-big-calendar';
import Select from 'react-select';
import { CommandesCalendarEventLabel } from './CommandesCalendarEventLabel.tsx';
import type { CommandesCalendarViewModel } from '../../../hooks/index.ts';
import type { CommandesCalendarEvent } from '../../../utils/types/index.ts';
import { CALENDAR_MESSAGES, calendarLocalizer } from '../../../utils/scripts/index.ts';
import { createReactSelectStyles } from '../../../utils/styles/index.ts';

const messages = { ...CALENDAR_MESSAGES, event: 'Rendez-vous', noEventsInRange: 'Aucun rendez-vous sur cette période.' };
const calendarComponents = { event: CommandesCalendarEventLabel };
const selectStyles = createReactSelectStyles<{ value: string; label: string }, false>();

export function CommandesCalendar({ model }: { model: CommandesCalendarViewModel }): ReactElement {
  return <div className="commandesCalendar">
    <div className="commandesCalendar__filters">
      <div className="commandesList__filter-group commandesCalendar__campaign"><label htmlFor="rdv-campaign">Campagne</label><Select inputId="rdv-campaign" styles={selectStyles} options={model.campaignOptions} value={model.campaignOptions.find((option) => option.value === String(model.campaignId)) ?? null} onChange={(option) => model.changeCampaign(option ? Number(option.value) : null)} placeholder="Choisir une campagne de leads…" isClearable /></div>
      <div className="commandesList__filter-group commandesCalendar__search"><label htmlFor="rdv-search">Recherche toutes campagnes</label><input id="rdv-search" type="search" maxLength={120} value={model.search} onChange={(event) => model.changeSearch(event.target.value)} placeholder="N° RDV, téléphone, société, contact…" /></div>
      <div className="commandesList__filter-group"><label htmlFor="rdv-status">Statut</label><Select inputId="rdv-status" styles={selectStyles} options={model.statusOptions} value={model.statusOptions.find((option) => option.value === model.statut)} onChange={(option) => model.changeStatus(option?.value ?? '')} isSearchable={false} /></div>
      <div className="commandesList__filter-group"><label htmlFor="rdv-agent">Commercial</label><Select inputId="rdv-agent" styles={selectStyles} options={model.agentOptions} value={model.agentOptions.find((option) => option.value === String(model.agentId ?? '')) ?? model.agentOptions[0]} onChange={(option) => model.changeAgent(option?.value ?? '')} /></div>
    </div>
    {model.searching && <section className="commandesCalendar__results" aria-label="Résultats de recherche des rendez-vous" aria-busy={model.searchLoading}>
      <p>Rendez-vous de toutes les campagnes de leads · Sélectionnez un résultat pour rejoindre sa date.</p>
      {model.searchLoading && <p role="status">Recherche en cours…</p>}
      {model.searchError && <p role="alert">{model.searchError}</p>}
      {!model.searchLoading && !model.searchError && model.results.length === 0 && <p>Aucun rendez-vous trouvé.</p>}
      {model.results.map((result) => <button className="commandesCalendar__result" type="button" key={result.id} onClick={() => model.jumpToLead(result.lead)}><strong>{result.label}</strong><span>{result.dateLabel}</span></button>)}
      {model.searchPagination && model.searchPagination.totalPages > 1 && <div className="commandesList__pagination"><button type="button" disabled={model.searchPage === 1} onClick={() => model.setSearchPage(model.searchPage - 1)}>Précédent</button><span>{model.searchPage} / {model.searchPagination.totalPages}</span><button type="button" disabled={model.searchPage >= model.searchPagination.totalPages} onClick={() => model.setSearchPage(model.searchPage + 1)}>Suivant</button></div>}
    </section>}
    <div className="commandesCalendar__legend" aria-label="Légende du calendrier"><span><i className="commandesCalendar__swatch--free" />Créneau libre</span><span><i className="commandesCalendar__swatch--lead" />Rendez-vous</span><span><i className="commandesCalendar__swatch--locked" />Créneau verrouillé</span><span><i className="commandesCalendar__swatch--occupied" />Occupé (RDV masqué ou agenda partagé)</span><button type="button" onClick={model.refresh}>Actualiser</button></div>
    {!model.campaignId && <p className="empty">Sélectionnez une campagne de leads pour consulter ses rendez-vous et ses créneaux.</p>}
    {model.error && <p className="commandesList__error" role="alert">{model.error} Les disponibilités ne peuvent pas être affichées.</p>}
    {model.loading && <p role="status">Chargement des rendez-vous et des disponibilités…</p>}
    {model.campaignId && <div className={`commandesCalendar__grid${!model.data || !model.data.lead_booking ? ' commandesCalendar__grid--unknown' : ''}`} aria-busy={model.loading}>
      {model.data && !model.data.lead_booking && <p>Créneaux non configurés pour cette campagne : disponibilités indéterminées.</p>}
      <Calendar<CommandesCalendarEvent> localizer={calendarLocalizer} culture="fr" messages={messages} components={calendarComponents} events={model.events} backgroundEvents={model.backgroundEvents} date={model.date} view={model.view} onNavigate={model.changeDate} onView={model.changeView} onSelectEvent={model.selectEvent} eventPropGetter={model.eventPropGetter} dayPropGetter={model.dayPropGetter} startAccessor="start" endAccessor="end" tooltipAccessor="tooltip" views={['month', 'week', 'day']} step={15} timeslots={4} scrollToTime={model.scrollTime} popup selectable={false} />
    </div>}
  </div>;
}
