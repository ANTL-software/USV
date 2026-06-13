import './commerciaux.scss';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { ReactElement, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { Calendar, Views, type View } from 'react-big-calendar';
import WithAuth from '../../../utils/middleware/WithAuth';

import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import { CALENDAR_MESSAGES, calendarLocalizer } from '../../../utils/scripts/bookingUtils';
import { getMyPlanningService, type CalendarPlanningEvent } from '../../../API/services/planning.service';

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
          <h1 className="commerciauxPlaceholder__title">Voir mon planning</h1>

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
      <BackToTop />
    </div>
  );
}

const MonPlanningWithAuth = WithAuth(MonPlanning);
export default MonPlanningWithAuth;
