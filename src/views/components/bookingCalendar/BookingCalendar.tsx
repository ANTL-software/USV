// styles
import "./bookingCalendar.scss";

// hooks | libraries
import { ReactElement, useEffect, useCallback, useState } from "react";
import { format } from "date-fns";

import { IoAdd } from "react-icons/io5";

// context
import { useBookingContext } from "../../../hooks/useBookingContext.ts";

// models
import type { BookingModel } from "../../../API/models/booking.model.ts";
import type { CalendarEvent } from "../../../API/models/booking.model.ts";

// components
import BookingForm from "../bookingForm/BookingForm.tsx";
import type { BookingFormData } from "../bookingForm/BookingForm.tsx";
import BookingDetailModal from "../bookingDetailModal/BookingDetailModal.tsx";
import BookingMoveModal from "../bookingMoveModal/BookingMoveModal.tsx";
import SimpleWeekCalendar from "./SimpleWeekCalendar.tsx";
import SimpleMonthCalendar from "./SimpleMonthCalendar.tsx";

export default function BookingCalendar(): ReactElement {
  const { bookings, isLoading, fetchBookings, createBooking, cancelBooking } = useBookingContext();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<"week" | "month">("week");
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

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const handleDateJump = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const newDate = new Date(e.target.value);
      if (!isNaN(newDate.getTime())) {
        setCurrentDate(newDate);
      }
    }
  }, []);

  const handleViewChange = useCallback((view: "week" | "month") => {
    setCurrentView(view);
  }, []);

  // Handler pour SimpleWeekCalendar (date + heure)
  const handleWeekSlotSelect = useCallback((date: Date, hour: number) => {
    const dateWithHour = new Date(date);
    dateWithHour.setHours(hour, 0, 0, 0);
    setPreselectedDate(format(dateWithHour, 'yyyy-MM-dd HH:mm'));
    setIsFormOpen(true);
  }, []);

  // Handler pour SimpleMonthCalendar (date)
  const handleMonthDaySelect = useCallback((date: Date) => {
    setPreselectedDate(format(date, 'yyyy-MM-dd'));
    setIsFormOpen(true);
  }, []);

  // Clic sur un événement → ouvrir le détail
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    const booking = bookings.find(b => b.id_booking === event.id) ?? null;
    setSelectedBooking(booking);
    setIsMoveOpen(false);
  }, [bookings]);

  const handleFormSubmit = useCallback(async (data: BookingFormData) => {
    try {
      await createBooking(data);
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

  return (
    <div id="bookingCalendar">
      <div className="calendarToolbar">
        <div className="viewSwitcher">
          <button
            className={`viewButton ${currentView === "week" ? "isActive" : ""}`}
            onClick={() => handleViewChange("week")}
          >
            Semaine
          </button>
          <button
            className={`viewButton ${currentView === "month" ? "isActive" : ""}`}
            onClick={() => handleViewChange("month")}
          >
            Mois
          </button>
        </div>
        <input
          type="date"
          className="dateJumpInput"
          value={format(currentDate, 'yyyy-MM-dd')}
          onChange={handleDateJump}
        />
        <button
          className="btnNewBooking"
          onClick={() => { setPreselectedDate(""); setIsFormOpen(true); }}
          disabled={isLoading}
        >
          <IoAdd />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="calendarBody">
        {currentView === "week" ? (
          <SimpleWeekCalendar
            bookings={bookings}
            currentDate={currentDate}
            onNavigate={handleNavigate}
            onSelectSlot={handleWeekSlotSelect}
            onSelectEvent={handleSelectEvent}
          />
        ) : (
          <SimpleMonthCalendar
            bookings={bookings}
            currentDate={currentDate}
            onNavigate={handleNavigate}
            onSelectDay={handleMonthDaySelect}
            onSelectEvent={handleSelectEvent}
          />
        )}
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
