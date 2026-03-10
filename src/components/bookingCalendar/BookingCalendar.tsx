// styles
import "./bookingCalendar.scss";
import "react-big-calendar/lib/css/react-big-calendar.css";

// hooks | libraries
import { ReactElement, useEffect, useCallback, useState } from "react";
import { Calendar } from "react-big-calendar";
import type { View, NavigateAction } from "react-big-calendar";
import { IoAdd } from "react-icons/io5";

// context
import { useBookingContext } from "../../hooks/useBookingContext.ts";

// models
import type { BookingModel } from "../../API/models/booking.model.ts";
import type { CalendarEvent } from "../../API/models/booking.model.ts";

// utils
import {
  calendarLocalizer,
  CALENDAR_MESSAGES,
  getEmployeColor,
} from "../../utils/scripts/bookingUtils.ts";

// components
import BookingForm from "../bookingForm/BookingForm.tsx";
import type { BookingFormData } from "../bookingForm/BookingForm.tsx";
import BookingDetailModal from "../bookingDetailModal/BookingDetailModal.tsx";
import BookingMoveModal from "../bookingMoveModal/BookingMoveModal.tsx";

export default function BookingCalendar(): ReactElement {
  const { bookings, isLoading, fetchBookings, createBooking, cancelBooking } = useBookingContext();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("week");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingModel | null>(null);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  useEffect(() => {
    fetchBookings({ statut: 'confirme' });
  }, [fetchBookings]);

  const handleNavigate = useCallback((newDate: Date, _view: View, _action: NavigateAction) => {
    setCurrentDate(newDate);
  }, []);

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  const handleFormSubmit = useCallback(async (data: BookingFormData) => {
    try {
      await createBooking({
        id_beneficiaire: data.id_beneficiaire,
        date: data.date,
        heureDebut: data.heureDebut,
        heureFin: data.heureFin,
      });
      setIsFormOpen(false);
    } catch {
      // Erreur affichée via alertService dans le provider — le formulaire reste ouvert
    }
  }, [createBooking]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    const booking = bookings.find(b => b.id_booking === event.id) ?? null;
    setSelectedBooking(booking);
    setIsMoveOpen(false);
  }, [bookings]);

  const handleEventPropGetter = useCallback((event: CalendarEvent) => {
    const { bg, border } = getEmployeColor(event.id_beneficiaire);
    return {
      style: {
        backgroundColor: bg,
        borderLeft: `4px solid ${border}`,
        borderRadius: "6px",
        color: "white",
      },
    };
  }, []);

  const handleCancelBooking = useCallback(async () => {
    if (!selectedBooking) return;
    await cancelBooking(selectedBooking.id_booking);
    setSelectedBooking(null);
  }, [cancelBooking, selectedBooking]);

  const handleOpenMove = useCallback(() => {
    setIsMoveOpen(true);
  }, []);

  const handleMoved = useCallback(() => {
    setIsMoveOpen(false);
    setSelectedBooking(null);
  }, []);

  const calendarEvents = bookings.map(b => b.toCalendarEvent());

  return (
    <div id="bookingCalendar">
      <div className="calendarToolbar">
        <button className="btnNewBooking" onClick={() => setIsFormOpen(true)} disabled={isLoading}>
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
          views={["month", "week", "day"]}
          date={currentDate}
          onNavigate={handleNavigate}
          min={new Date(1970, 0, 1, 8, 0)}
          max={new Date(1970, 0, 1, 19, 0)}
          style={{ height: "100%" }}
          scrollToTime={new Date(1970, 0, 1, 8, 0)}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={handleEventPropGetter}
        />
      </div>

      {isFormOpen && (
        <BookingForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {selectedBooking && !isMoveOpen && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onMove={handleOpenMove}
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
