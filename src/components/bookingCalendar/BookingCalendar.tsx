// styles
import "./bookingCalendar.scss";
import "react-big-calendar/lib/css/react-big-calendar.css";

// hooks | libraries
import { ReactElement, useEffect, useCallback, useState } from "react";
import { Calendar } from "react-big-calendar";
import type { View, NavigateAction, SlotInfo } from "react-big-calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { IoAdd } from "react-icons/io5";

// context
import { useBookingContext } from "../../hooks/useBookingContext.ts";

// models
import type { BookingModel } from "../../API/models/booking.model.ts";
import type { CalendarEvent } from "../../API/models/booking.model.ts";

// utils
import { calendarLocalizer, CALENDAR_MESSAGES, getRoleColor, getInitials } from "../../utils/scripts/bookingUtils.ts";

// components
import BookingForm from "../bookingForm/BookingForm.tsx";
import type { BookingFormData } from "../bookingForm/BookingForm.tsx";
import BookingDetailModal from "../bookingDetailModal/BookingDetailModal.tsx";
import BookingMoveModal from "../bookingMoveModal/BookingMoveModal.tsx";

// ============================================
// Bulle (vue mois grille) + rectangle (popup +X) — CSS toggle
// ============================================
function BookingMonthEvent({ event }: { event: CalendarEvent }): ReactElement {
  const { bg } = getRoleColor(event.role);
  const initials = getInitials(event.title);
  const parts = event.title.trim().split(' ');
  const prenom = parts[0];
  const nom = parts.slice(1).join(' ');
  const label = `${event.id_beneficiaire} - ${prenom} ${nom}`;
  return (
    <>
      <div className="bookingBubble" style={{ backgroundColor: bg }} title={event.title}>
        {initials}
      </div>
      <div className="bookingWeekEvent bookingPopupEvent" style={{ backgroundColor: bg }} title={event.title}>
        {label}
      </div>
    </>
  );
}

// ============================================
// Rectangle de réservation (vue semaine)
// ============================================
function BookingWeekEvent({ event }: { event: CalendarEvent }): ReactElement {
  const { bg } = getRoleColor(event.role);
  const parts = event.title.trim().split(' ');
  const prenom = parts[0];
  const nom = parts.slice(1).join(' ');
  const label = `${event.id_beneficiaire} - ${prenom} ${nom}`;
  return (
    <div
      className="bookingWeekEvent"
      style={{ backgroundColor: bg }}
      title={event.title}
    >
      {label}
    </div>
  );
}

// ============================================
// Compteur de capacité par jour (mois + semaine)
// ============================================
function DayCapacityBadge({ date, bookings, capacite }: {
  date: Date;
  bookings: BookingModel[];
  capacite: number;
}): ReactElement {
  const dateStr = format(date, 'yyyy-MM-dd');
  const count = bookings.filter(b => b.date === dateStr && b.statut !== 'annule').length;
  const full = count >= capacite;
  return (
    <span className={`capacityBadge ${full ? 'full' : ''}`}>
      {count}/{capacite}
    </span>
  );
}

// ============================================
// Header de colonne semaine (label + capacité)
// ============================================
function WeekDayHeader({ date, label, bookings, capacite }: {
  date: Date;
  label: string;
  bookings: BookingModel[];
  capacite: number;
}): ReactElement {
  return (
    <div className="weekDayHeader">
      <span>{label}</span>
      <DayCapacityBadge date={date} bookings={bookings} capacite={capacite} />
    </div>
  );
}

export default function BookingCalendar(): ReactElement {
  const { bookings, isLoading, fetchBookings, createBooking, cancelBooking, config } = useBookingContext();
  const capacite = config?.capacite_journaliere ?? 6;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("week");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<BookingModel | null>(null);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  // Chargement initial + rechargement à la navigation
  useEffect(() => {
    const now = currentDate;
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    fetchBookings({
      statut: 'confirme',
      date_debut: format(firstDay, 'yyyy-MM-dd'),
      date_fin: format(lastDay, 'yyyy-MM-dd'),
    });
  }, [fetchBookings, currentDate]);

  const handleNavigate = useCallback((newDate: Date, _view: View, _action: NavigateAction) => {
    setCurrentDate(newDate);
  }, []);

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  // Clic sur une cellule vide → ouvrir le formulaire avec la date pré-remplie
  const handleSelectSlot = useCallback((slot: SlotInfo) => {
    const dateStr = format(slot.start, 'yyyy-MM-dd');
    setPreselectedDate(dateStr);
    setIsFormOpen(true);
  }, []);

  // Clic sur une bulle → ouvrir le détail
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    const booking = bookings.find(b => b.id_booking === event.id) ?? null;
    setSelectedBooking(booking);
    setIsMoveOpen(false);
  }, [bookings]);

  const handleFormSubmit = useCallback(async (data: BookingFormData) => {
    try {
      await createBooking({ id_beneficiaire: data.id_beneficiaire, date: data.date });
      setIsFormOpen(false);
    } catch {
      // Erreur affichée via alertService
    }
  }, [createBooking]);

  const handleCancelBooking = useCallback(async () => {
    if (!selectedBooking) return;
    await cancelBooking(selectedBooking.id_booking);
    setSelectedBooking(null);
  }, [cancelBooking, selectedBooking]);

  const handleMoved = useCallback(() => {
    setIsMoveOpen(false);
    setSelectedBooking(null);
  }, []);

  const calendarEvents = bookings.map(b => b.toCalendarEvent());

  // Custom event components par vue
  const components = {
    month: {
      event: BookingMonthEvent,
      dateHeader: ({ date, label }: { date: Date; label: string }) => (
        <div className="monthDateHeader">
          <span>{label}</span>
          <DayCapacityBadge date={date} bookings={bookings} capacite={capacite} />
        </div>
      ),
    },
    week: {
      event: BookingWeekEvent,
      header: ({ date, label }: { date: Date; label: string }) => (
        <WeekDayHeader date={date} label={label} bookings={bookings} capacite={capacite} />
      ),
    },
  };

  return (
    <div id="bookingCalendar">
      <div className="calendarToolbar">
        <button
          className="btnNewBooking"
          onClick={() => { setPreselectedDate(""); setIsFormOpen(true); }}
          disabled={isLoading}
        >
          <IoAdd />
          Nouvelle réservation
        </button>
      </div>

      <div className="calendarBody">
        <Calendar
          localizer={calendarLocalizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          messages={CALENDAR_MESSAGES}
          culture="fr"
          view={currentView}
          onView={handleViewChange}
          views={["month", "week"]}
          date={currentDate}
          onNavigate={handleNavigate}
          style={{ height: "100%" }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          components={components}
          popup
        />
      </div>

      {isFormOpen && (
        <BookingForm
          initialDate={preselectedDate}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {selectedBooking && !isMoveOpen && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onMove={() => setIsMoveOpen(true)}
          onCancel={handleCancelBooking}
        />
      )}

      {selectedBooking && isMoveOpen && (
        <BookingMoveModal
          booking={selectedBooking}
          onClose={() => setIsMoveOpen(false)}
          onMoved={handleMoved}
        />
      )}
    </div>
  );
}
