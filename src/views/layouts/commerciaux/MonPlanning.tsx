import './commerciaux.scss';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { ReactElement, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { Calendar, Views, type View } from 'react-big-calendar';
import Select from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';

import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import Modal from '../../components/modal/Modal';
import { CALENDAR_MESSAGES, calendarLocalizer } from '../../../utils/scripts/bookingUtils';
import { getMyPlanningService, type CalendarPlanningEvent } from '../../../API/services/planning.service';
import { useAbsenceRequests } from '../../../hooks/useAbsenceRequests';
import { ABSENCE_MOTIFS, ABSENCE_STATUS_LABELS } from '../../../utils/constants/absence.constants';

type PlanningEvent = {
  title: string;
  start: Date;
  end: Date;
  event_type?: 'work' | 'holiday';
  holiday_name?: string | null;
};

const pad = (value: number): string => String(value).padStart(2, '0');

const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const getStartOfWeek = (date: Date): Date => {
  const next = new Date(date);
  const diff = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - diff);
  next.setHours(0, 0, 0, 0);
  return next;
};

const getEndOfWeek = (date: Date): Date => {
  const next = getStartOfWeek(date);
  next.setDate(next.getDate() + 6);
  return next;
};

const addHours = (date: Date, hours: number): Date => {
  const next = new Date(date);
  next.setHours(next.getHours() + hours);
  return next;
};

const getDateKey = (date: Date): string => toDateKey(date);

const getDurationHours = (start: Date, end: Date): number => (end.getTime() - start.getTime()) / (1000 * 60 * 60);

const formatHoursLabel = (hours: number): string => {
  if (Number.isInteger(hours)) {
    return `${hours} ${hours > 1 ? 'heures' : 'heure'}`;
  }

  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);

  if (whole === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${whole} ${whole > 1 ? 'heures' : 'heure'}`;
  }

  return `${whole}h${String(minutes).padStart(2, '0')}`;
};

const buildMonthEvents = (events: CalendarPlanningEvent[]): PlanningEvent[] => {
  const grouped = new Map<string, { start: Date; holidayName: string | null; workHours: number }>();

  events.forEach((event) => {
    const key = getDateKey(event.start);
    const existing = grouped.get(key) || { start: event.start, holidayName: null, workHours: 0 };

    if (event.event_type === 'holiday' && event.holiday_name) {
      existing.holidayName = event.holiday_name;
    } else if (event.event_type === 'work') {
      existing.workHours += getDurationHours(event.start, event.end);
    }

    grouped.set(key, existing);
  });

  return Array.from(grouped.values())
    .filter((entry) => entry.holidayName || entry.workHours > 0)
    .map((entry) => ({
      title: entry.holidayName || formatHoursLabel(entry.workHours),
      start: entry.start,
      end: addHours(entry.start, 1),
      event_type: entry.holidayName ? 'holiday' : 'work',
      holiday_name: entry.holidayName,
    }));
};

const splitWorkEventByHour = (event: CalendarPlanningEvent): PlanningEvent[] => {
  const segments: PlanningEvent[] = [];
  let cursor = new Date(event.start);

  while (cursor < event.end) {
    const next = addHours(cursor, 1);
    const segmentEnd = next < event.end ? next : new Date(event.end);

    segments.push({
      title: 'antl',
      start: new Date(cursor),
      end: segmentEnd,
      event_type: 'work',
      holiday_name: null,
    });

    cursor = next;
  }

  return segments;
};

const buildDetailedEvents = (events: CalendarPlanningEvent[]): PlanningEvent[] => {
  return events.flatMap((event) => {
    if (event.event_type === 'holiday') {
      return [{
        title: event.holiday_name || event.title,
        start: event.start,
        end: event.end,
        event_type: 'holiday',
        holiday_name: event.holiday_name,
      }];
    }

    return splitWorkEventByHour(event);
  });
};

function MonPlanning(): ReactElement {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [sourceEvents, setSourceEvents] = useState<CalendarPlanningEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const minTime = new Date();
  minTime.setHours(7, 0, 0, 0);
  const maxTime = new Date();
  maxTime.setHours(18, 0, 0, 0);
  const {
    isCreateModalOpen,
    isListModalOpen,
    form,
    requests,
    isSubmitting,
    isLoadingList,
    formError,
    listError,
    selectedMotif,
    openCreateModal,
    closeCreateModal,
    openListModal,
    closeListModal,
    updateField,
    submitRequest,
  } = useAbsenceRequests();

  const range = useMemo(() => {
    const baseDate = new Date(currentDate);
    baseDate.setHours(0, 0, 0, 0);

    if (currentView === Views.WEEK) {
      return {
        start: getStartOfWeek(baseDate),
        end: getEndOfWeek(baseDate),
      };
    }

    if (currentView === Views.DAY) {
      return {
        start: baseDate,
        end: baseDate,
      };
    }

    return {
      start: new Date(baseDate.getFullYear(), baseDate.getMonth(), 1),
      end: new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0),
    };
  }, [currentDate, currentView]);

  useEffect(() => {
    const loadPlanning = async () => {
      setIsLoading(true);

      try {
        const data = await getMyPlanningService(toDateKey(range.start), toDateKey(range.end));
        setSourceEvents(data.events);
      } catch (error) {
        console.error('Erreur lors du chargement du planning:', error);
        setSourceEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadPlanning();
  }, [range]);

  const events = useMemo(() => {
    if (currentView === Views.MONTH) {
      return buildMonthEvents(sourceEvents);
    }

    return buildDetailedEvents(sourceEvents);
  }, [currentView, sourceEvents]);

  const eventPropGetter = (event: PlanningEvent) => {
    if (event.event_type === 'holiday') {
      return {
        style: {
          background: '#f59e0b',
          color: '#ffffff',
          border: 'none',
        },
      };
    }

    return {
      style: {
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        color: '#ffffff',
        border: 'none',
      },
    };
  };

  return (
    <div id="commerciauxPlaceholder">
      <Header />
      <SubNav />
      <main>
        <div className="commerciauxPlaceholder__back">
          <Button style="back" onClick={() => navigate('/commerciaux')}>
            <MdArrowBack />
            <span>Retour</span>
          </Button>
        </div>

        <div className="commerciauxPlaceholder__wrapper">
          <div className="commerciauxPlaceholder__header">
            <h1 className="commerciauxPlaceholder__title">Voir mon planning</h1>
            <div className="commerciauxPlaceholder__actions">
              <Button style="white" onClick={openListModal}>
                <span>Mes demandes d&apos;absence</span>
              </Button>
              <Button style="gradient" onClick={openCreateModal}>
                <span>Faire une demande d&apos;absence</span>
              </Button>
            </div>
          </div>

          <section className="commerciauxPlaceholder__calendarWrapper">
            {isLoading && <p className="commerciauxPlaceholder__loading">Chargement du planning...</p>}
            <Calendar
              localizer={calendarLocalizer}
              culture="fr"
              messages={CALENDAR_MESSAGES}
              events={events}
              date={currentDate}
              view={currentView}
              onNavigate={setCurrentDate}
              onView={setCurrentView}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={eventPropGetter}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              min={minTime}
              max={maxTime}
              popup
            />
          </section>
        </div>
      </main>

      <Modal
        isVisible={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Faire une demande d’absence"
      >
        <div className="commerciauxPlaceholder__absenceModal">
          <div className="commerciauxPlaceholder__absenceGrid">
            <label className="commerciauxPlaceholder__field">
              <span>Motif</span>
              <Select
                classNamePrefix="reactSelect"
                options={ABSENCE_MOTIFS}
                value={selectedMotif}
                onChange={(option) => updateField('motif_code', option?.value ?? '')}
                placeholder="Veuillez sélectionner un motif"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 100000 }),
                }}
              />
            </label>

            <label className="commerciauxPlaceholder__field">
              <span>Type de demande</span>
              <div className="commerciauxPlaceholder__typeToggle">
                <button
                  type="button"
                  className={form.type_demande === 'jours' ? 'is-active' : ''}
                  onClick={() => updateField('type_demande', 'jours')}
                >
                  Plage de jours
                </button>
                <button
                  type="button"
                  className={form.type_demande === 'heures' ? 'is-active' : ''}
                  onClick={() => updateField('type_demande', 'heures')}
                >
                  Plage horaire
                </button>
              </div>
            </label>
          </div>

          <label className="commerciauxPlaceholder__field">
            <span>Pourquoi cette demande d’absence ?</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Veuillez expliquer le contexte de votre demande"
            />
          </label>

          <div className="commerciauxPlaceholder__absenceGrid">
            <label className="commerciauxPlaceholder__field">
              <span>Date de début</span>
              <input
                type="date"
                value={form.date_debut}
                onChange={(event) => updateField('date_debut', event.target.value)}
              />
            </label>

            <label className="commerciauxPlaceholder__field">
              <span>{form.type_demande === 'heures' ? 'Date concernée' : 'Date de fin'}</span>
              <input
                type="date"
                value={form.type_demande === 'heures' ? form.date_debut : form.date_fin}
                onChange={(event) => updateField('date_fin', event.target.value)}
                disabled={form.type_demande === 'heures'}
              />
            </label>
          </div>

          {form.type_demande === 'heures' && (
            <div className="commerciauxPlaceholder__absenceGrid">
              <label className="commerciauxPlaceholder__field">
                <span>Heure de début</span>
                <input
                  type="time"
                  value={form.heure_debut}
                  onChange={(event) => updateField('heure_debut', event.target.value)}
                />
              </label>

              <label className="commerciauxPlaceholder__field">
                <span>Heure de fin</span>
                <input
                  type="time"
                  value={form.heure_fin}
                  onChange={(event) => updateField('heure_fin', event.target.value)}
                />
              </label>
            </div>
          )}

          {selectedMotif?.justificatif_requis && (
            <p className="commerciauxPlaceholder__absenceHint">
              Un justificatif vous sera demandé pour ce motif.
            </p>
          )}

          {formError && (
            <p className="commerciauxPlaceholder__absenceError">{formError}</p>
          )}

          <div className="commerciauxPlaceholder__absenceFooter">
            <Button style="grey" onClick={closeCreateModal}>
              <span>Annuler</span>
            </Button>
            <Button style="gradient" onClick={() => void submitRequest()} disabled={isSubmitting}>
              <span>{isSubmitting ? 'Envoi...' : 'Envoyer la demande'}</span>
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isVisible={isListModalOpen}
        onClose={closeListModal}
        title="Mes demandes d’absence"
      >
        <div className="commerciauxPlaceholder__absenceList">
          {isLoadingList ? (
            <p className="commerciauxPlaceholder__absenceState">Chargement...</p>
          ) : listError ? (
            <p className="commerciauxPlaceholder__absenceError">{listError}</p>
          ) : requests.length === 0 ? (
            <p className="commerciauxPlaceholder__absenceState">Aucune demande d’absence pour le moment.</p>
          ) : (
            requests.map((request) => (
              <article key={request.id_demande} className="commerciauxPlaceholder__absenceCard">
                <div className="commerciauxPlaceholder__absenceCardHeader">
                  <div>
                    <h3>{request.motif_label}</h3>
                    <p>Demandée le {new Date(request.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`commerciauxPlaceholder__status commerciauxPlaceholder__status--${request.statut}`}>
                    {ABSENCE_STATUS_LABELS[request.statut]}
                  </span>
                </div>

                <p className="commerciauxPlaceholder__absenceCardText">{request.description}</p>

                <div className="commerciauxPlaceholder__absenceMeta">
                  <span>
                    {request.type_demande === 'heures'
                      ? `${request.date_debut} • ${request.heure_debut?.slice(0, 5)} - ${request.heure_fin?.slice(0, 5)}`
                      : `${request.date_debut} au ${request.date_fin}`}
                  </span>
                  {request.justificatif_requis && <strong>Justificatif demandé</strong>}
                </div>
              </article>
            ))
          )}
        </div>
      </Modal>
      <BackToTop />
    </div>
  );
}

const MonPlanningWithAuth = WithAuth(MonPlanning);
export default MonPlanningWithAuth;
