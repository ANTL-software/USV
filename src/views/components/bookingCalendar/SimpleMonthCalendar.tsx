import { ReactElement, useMemo } from "react";
import { format, startOfMonth, addDays, isSameDay, isToday, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

import type { BookingModel } from "../../../API/models/booking.model.ts";
import type { CalendarEvent } from "../../../API/models/booking.model.ts";

import "./simpleMonthCalendar.scss";

interface SimpleMonthCalendarProps {
  bookings: BookingModel[];
  currentDate: Date;
  onNavigate: (newDate: Date) => void;
  onSelectDay: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export default function SimpleMonthCalendar({ bookings, currentDate, onNavigate, onSelectDay, onSelectEvent }: SimpleMonthCalendarProps): ReactElement {
  // Générer les jours du mois
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = differenceInDays(end, start) + 1;
    return Array.from({ length: daysInMonth }, (_, i) => addDays(start, i));
  }, [currentDate]);

  // Jour de la semaine du premier jour (0=dimanche, 1=lundi...)
  const firstDayOfWeek = monthDays[0]?.getDay() || 1;

  // Jours de remplissage pour commencer la grille au lundi
  const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Convertir les bookings en events
  const events = useMemo(() => {
    return bookings.map(b => b.toCalendarEvent());
  }, [bookings]);

  // Trouver les events pour un jour donné
  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(event.start, date));
  };

  // Naviguer vers le mois précédent/suivant
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onNavigate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onNavigate(newDate);
  };

  return (
    <div className="simpleMonthCalendar">
      {/* Header avec navigation */}
      <div className="smcHeader">
        <button className="smcNavButton" onClick={goToPreviousMonth}>
          ←
        </button>
        <div className="smcTitle">
          {format(currentDate, "MMMM yyyy", { locale: fr })}
        </div>
        <button className="smcNavButton" onClick={goToNextMonth}>
          →
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="smcWeekdays">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(day => (
          <div key={day} className="smcWeekday">{day}</div>
        ))}
      </div>

      {/* Grille du mois */}
      <div className="smcGrid">
        {/* Jours de remplissage */}
        {Array.from({ length: paddingDays }).map((_, i) => (
          <div key={`padding-${i}`} className="smcDay smcDayPadding"></div>
        ))}

        {/* Jours réels du mois */}
        {monthDays.map(day => {
          const dayEvents = getEventsForDay(day);
          const isDayToday = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`smcDay ${isDayToday ? 'isToday' : ''}`}
              onClick={() => onSelectDay(day)}
            >
              <div className="smcDayNumber">{format(day, "d")}</div>
              <div className="smcEvents">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="smcEvent"
                    style={{ backgroundColor: event.couleur || '#6b7280' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(event);
                    }}
                    title={event.title}
                  >
                    {format(event.start, "HH:mm")} {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="smcMoreEvents">
                    +{dayEvents.length - 3} de plus
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
