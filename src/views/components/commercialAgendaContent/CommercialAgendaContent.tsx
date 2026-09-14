import 'react-big-calendar/lib/css/react-big-calendar.css';

import type { ReactElement } from 'react';
import { Calendar } from 'react-big-calendar';
import Select from 'react-select';
import { IoCalendarOutline, IoRefreshOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import type { CommercialAgendaViewModel } from '../../../hooks/index.ts';
import { CALENDAR_MESSAGES, calendarLocalizer } from '../../../utils/scripts/index.ts';
import { BackToTop, Button, CommercialAgendaDetailsModal, CommercialAgendaEditModal, Header, SubNav } from '../index.ts';

interface CommercialAgendaContentProps {
  viewModel: CommercialAgendaViewModel;
}

export function CommercialAgendaContent({ viewModel }: CommercialAgendaContentProps): ReactElement {
  const { calendar } = viewModel;
  return <div id="commercialAgenda">
    <Header />
    <SubNav />
    <main>
      <div className="commercialAgenda__back"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour aux commerciaux</span></Button></div>
      <div className="commercialAgenda__wrapper">
        <header className="commercialAgenda__header">
          <div><span className="commercialAgenda__eyebrow"><IoCalendarOutline /> Supervision des agendas</span><h1>Agenda travail commerciaux</h1><p>Consultez et ajustez les rappels en restant strictement dans l’agenda du commercial choisi.</p></div>
          <Button style="white" onClick={() => void viewModel.refresh()} disabled={!viewModel.selectedCommercial || viewModel.isLoadingAgenda}><IoRefreshOutline /><span>Actualiser</span></Button>
        </header>

        <section className="commercialAgenda__selectorCard">
          <label htmlFor="commercialAgendaSelect">Commercial</label>
          <Select
            inputId="commercialAgendaSelect"
            classNamePrefix="commercialAgendaSelect"
            options={viewModel.commercialOptions}
            value={viewModel.selectedCommercialOption}
            onChange={viewModel.selectCommercial}
            isLoading={viewModel.isLoadingCommercials}
            isDisabled={viewModel.isLoadingCommercials}
            placeholder="Choisir un commercial"
            noOptionsMessage={() => 'Aucun commercial actif'}
          />
          {viewModel.selectedCommercial && <p className="commercialAgenda__identityNotice"><strong>Vue en tant que {viewModel.selectedCommercialOption?.label}.</strong> Une modification change uniquement le rendez-vous ; son propriétaire reste ce commercial.</p>}
        </section>

        {viewModel.loadError && <div className="commercialAgenda__errorState" role="alert"><p>{viewModel.loadError}</p><Button style="white" onClick={() => void viewModel.refresh()}>Réessayer</Button></div>}
        {!viewModel.loadError && !viewModel.selectedCommercial && !viewModel.isLoadingCommercials && <div className="commercialAgenda__empty">Aucun commercial actif n’est disponible.</div>}
        {viewModel.selectedCommercial && <section className="commercialAgenda__calendarCard" aria-busy={viewModel.isLoadingAgenda}>
          {viewModel.isLoadingAgenda && <p className="commercialAgenda__loading">Chargement de l’agenda...</p>}
          <Calendar
            localizer={calendarLocalizer}
            culture="fr"
            messages={CALENDAR_MESSAGES}
            events={calendar.events}
            date={calendar.currentDate}
            view={calendar.currentView}
            onNavigate={calendar.setCurrentDate}
            onView={calendar.setCurrentView}
            onSelectEvent={viewModel.selectEvent}
            eventPropGetter={calendar.eventPropGetter}
            startAccessor="start"
            endAccessor="end"
            views={['month', 'week', 'day']}
            min={new Date(1970, 0, 1, 8, 0)}
            max={new Date(1970, 0, 1, 19, 0)}
            step={15}
            timeslots={4}
            popup
          />
        </section>}
      </div>
    </main>
    <CommercialAgendaDetailsModal viewModel={viewModel.details} />
    <CommercialAgendaEditModal viewModel={viewModel.edit} />
    <BackToTop />
  </div>;
}
