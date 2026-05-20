import { ReactElement, useMemo, useCallback } from "react";
import { format, startOfWeek, addDays, isSameDay, subWeeks, addWeeks } from "date-fns";
import { fr } from "date-fns/locale";

import type { BookingModel } from "../../../API/models/booking.model.ts";
import type { CalendarEvent } from "../../../API/models/booking.model.ts";

import "./simpleWeekCalendar.scss";

interface SimpleWeekCalendarProps {
  bookings: BookingModel[];
  currentDate: Date;
  onNavigate: (newDate: Date) => void;
  onSelectSlot: (date: Date, hour: number) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export default function SimpleWeekCalendar({ bookings, currentDate, onNavigate, onSelectSlot, onSelectEvent }: SimpleWeekCalendarProps): ReactElement {
  // Configuration des heures (7h à 19h = 12 heures d'affichage)
  const startHour = 7;
  const endHour = 19;
  const totalHours = endHour - startHour;
  const totalMinutes = totalHours * 60;

  // Générer les 7 jours de la semaine
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  // Convertir les bookings en events
  const events = useMemo(() => {
    const evts = bookings.map(b => b.toCalendarEvent());
    console.log('[SimpleWeekCalendar] bookings:', bookings.length);
    console.log('[SimpleWeekCalendar] events:', evts);
    return evts;
  }, [bookings]);

  // Calculer le style d'un événement (position et taille)
  const getEventStyle = (event: CalendarEvent, dayIndex: number) => {
    const start = event.start;
    const end = event.end;

    // Vérifier que l'événement chevauche ce jour
    const dayStart = new Date(weekDays[dayIndex]);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(weekDays[dayIndex]);
    dayEnd.setHours(23, 59, 59, 999);

    // L'événement ne chevauche pas ce jour s'il se termine avant le début ou commence après la fin
    if (end < dayStart || start > dayEnd) {
      return null;
    }

    // Calculer les minutes depuis 7h
    const startMinutes = (start.getHours() - startHour) * 60 + start.getMinutes();
    const endMinutes = (end.getHours() - startHour) * 60 + end.getMinutes();

    // Clamp aux limites d'affichage (7h-19h)
    const clampedStartMinutes = Math.max(0, Math.min(startMinutes, totalMinutes));
    const clampedEndMinutes = Math.max(0, Math.min(endMinutes, totalMinutes));

    // Calculer la position et taille en pourcentage
    const top = (clampedStartMinutes / totalMinutes) * 100;
    const height = Math.max(2, (clampedEndMinutes - clampedStartMinutes) / totalMinutes * 100);

    return {
      top: `${top}%`,
      height: `${height}%`,
      left: `${(dayIndex / 7) * 100}%`,
      width: `${100 / 7}%`,
    };
  };

  // Navigation
  const goToPreviousWeek = useCallback(() => {
    onNavigate(subWeeks(currentDate, 1));
  }, [currentDate, onNavigate]);

  const goToNextWeek = useCallback(() => {
    onNavigate(addWeeks(currentDate, 1));
  }, [currentDate, onNavigate]);

  const weekRange = `${format(weekDays[0], "dd MMM", { locale: fr })} - ${format(weekDays[6], "dd MMM", { locale: fr })}`;

  return (
    <div className="simpleWeekCalendar">
      {/* Toolbar avec navigation */}
      <div className="swcToolbar">
        <button className="swcNavButton" onClick={goToPreviousWeek}>
          ← Semaine précédente
        </button>
        <div className="swcTitle">
          Semaine {weekRange}
        </div>
        <button className="swcNavButton" onClick={goToNextWeek}>
          Semaine suivante →
        </button>
      </div>

      {/* Header avec les jours */}
      <div className="swcHeader">
        <div className="swcCorner"></div>
        {weekDays.map(day => (
          <div key={day.toISOString()} className="swcDayHeader">
            <div className="swcDayName">{format(day, "EEE", { locale: fr })}</div>
            <div className="swcDayNumber">{format(day, "dd")}</div>
          </div>
        ))}
      </div>

      {/* Grille horaire absolue */}
      <div className="swcGrid">
        {/* Labels des heures */}
        <div className="swcHours">
          {Array.from({ length: totalHours + 1 }, (_, i) => {
            // Skip le premier et le dernier label
            if (i === 0 || i === totalHours) return null;
            return (
              <div key={i} className="swcHourLabel" style={{ top: `${(i / totalHours) * 100}%` }}>
                {String(startHour + i)}h
              </div>
            );
          })}
        </div>

        {/* Colonnes pour chaque jour */}
        <div className="swcDays">
          {/* Colonnes de fond */}
          {weekDays.map((_, dayIndex) => (
            <div key={dayIndex} className="swcDayColumn">
              {/* Lignes horaires de fond */}
              {Array.from({ length: totalHours }, (_, hour) => (
                <div
                  key={hour}
                  className="swcHourRow"
                  style={{ top: `${(hour / totalHours) * 100}%` }}
                >
                  <div
                    className="swcHourCell"
                    onClick={() => onSelectSlot(weekDays[dayIndex], startHour + hour)}
                  />
                </div>
              ))}
            </div>
          ))}

          {/* Événements positionnés en absolu */}
          {events.map(event => {
            const eventDate = event.start;
            const dayIndex = weekDays.findIndex(d => isSameDay(d, eventDate));

            if (dayIndex === -1) return null;

            const style = getEventStyle(event, dayIndex);
            if (!style) return null;

            console.log(`[Event ${event.id}] style:`, style);
            return (
              <div
                key={event.id}
                className="swcEvent"
                style={{
                  ...style,
                  backgroundColor: event.couleur || '#6b7280',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEvent(event);
                }}
                title={event.title}
              >
                <div className="swcEventContent">
                  <div className="swcEventTime">
                    {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
                  </div>
                  <div className="swcEventTitle">{event.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
