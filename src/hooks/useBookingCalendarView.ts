import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BookingModel } from '../API/models/index.ts';
import {
  applyBookingDefaultEnd,
  BOOKING_HOUR_OPTIONS,
  BOOKING_MINUTE_OPTIONS,
  BOOKING_START_HOUR,
  BOOKING_WEEKDAYS,
  buildBookingMonthFilters,
  buildBookingMonthView,
  buildBookingWeekView,
  buildCreateBookingPayload,
  buildMoveBookingPayload,
  createBookingFormState,
  createBookingMoveFormState,
  formatBookingDateInput,
  getBookingDetailPresentation,
  parseBookingDateJump,
  shiftBookingMonth,
  shiftBookingWeek,
} from '../utils/scripts/index.ts';
import type { BookingMonthView, BookingWeekView } from '../utils/scripts/index.ts';
import type {
  BookingFormState,
  BookingMoveFormState,
  BookingTimeOption,
  BookingViewMode,
  CalendarEvent,
  EmployeOption,
} from '../utils/types/index.ts';
import { useBookingContext } from './useBookingContext.ts';

export interface BookingFormViewModel {
  close: () => void;
  employees: EmployeOption[];
  hourOptions: BookingTimeOption[];
  isOpen: boolean;
  isSubmitting: boolean;
  loadingEmployees: boolean;
  minuteOptions: BookingTimeOption[];
  portalTarget?: HTMLElement;
  state: BookingFormState;
  submit: () => Promise<void>;
  today: string;
  updateField: <K extends keyof BookingFormState>(field: K, value: BookingFormState[K]) => void;
}

export interface BookingMoveViewModel {
  beneficiaryLabel: string;
  close: () => void;
  hourOptions: BookingTimeOption[];
  isOpen: boolean;
  isSubmitting: boolean;
  minuteOptions: BookingTimeOption[];
  portalTarget?: HTMLElement;
  state: BookingMoveFormState | null;
  submit: () => Promise<void>;
  today: string;
  updateField: <K extends keyof BookingMoveFormState>(field: K, value: BookingMoveFormState[K]) => void;
}

export interface BookingDetailViewModel {
  booking: BookingModel | null;
  cancel: () => Promise<void>;
  close: () => void;
  dateLabel: string;
  employeeLabel: string;
  isCancelling: boolean;
  isConfirming: boolean;
  move: () => void;
  rejectCancellation: () => void;
  requestCancellation: () => void;
  timeLabel: string;
}

export interface BookingWeekCalendarViewModel {
  navigate: (direction: -1 | 1) => void;
  selectEvent: (event: CalendarEvent) => void;
  selectSlot: (date: Date, hour: number) => void;
  startHour: number;
  view: BookingWeekView;
}

export interface BookingMonthCalendarViewModel {
  navigate: (direction: -1 | 1) => void;
  selectDay: (date: Date) => void;
  selectEvent: (event: CalendarEvent) => void;
  view: BookingMonthView;
  weekdays: string[];
}

export interface BookingCalendarViewModel {
  currentDateInput: string;
  currentView: BookingViewMode;
  detail: BookingDetailViewModel;
  form: BookingFormViewModel;
  isLoading: boolean;
  month: BookingMonthCalendarViewModel;
  move: BookingMoveViewModel;
  openNewBooking: () => void;
  setCurrentDate: (value: string) => void;
  setCurrentView: (view: BookingViewMode) => void;
  week: BookingWeekCalendarViewModel;
}

export function useBookingCalendarView(): BookingCalendarViewModel {
  const {
    bookings,
    cancelBooking,
    createBooking,
    employes,
    fetchBookings,
    isLoading,
    loadingEmployes,
    updateBooking,
  } = useBookingContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<BookingViewMode>('week');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState<BookingFormState>(() => createBookingFormState());
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingModel | null>(null);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [moveState, setMoveState] = useState<BookingMoveFormState | null>(null);
  const [isMoveSubmitting, setIsMoveSubmitting] = useState(false);
  const [isConfirmingCancellation, setIsConfirmingCancellation] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const today = formatBookingDateInput(new Date());

  useEffect(() => {
    void fetchBookings(buildBookingMonthFilters(currentDate));
  }, [currentDate, fetchBookings]);

  const events = useMemo(() => bookings.map((booking) => booking.toCalendarEvent()), [bookings]);
  const weekView = useMemo(() => buildBookingWeekView(events, currentDate), [currentDate, events]);
  const monthView = useMemo(() => buildBookingMonthView(events, currentDate), [currentDate, events]);

  const openForm = useCallback((initialDate = ''): void => {
    setFormState(createBookingFormState(initialDate));
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback((): void => {
    if (!isFormSubmitting) setIsFormOpen(false);
  }, [isFormSubmitting]);

  const updateFormField = useCallback(<K extends keyof BookingFormState>(field: K, value: BookingFormState[K]): void => {
    setFormState((previous) => {
      const next = { ...previous, [field]: value, error: '' };
      return field === 'date' || field === 'heure' || field === 'minute' ? applyBookingDefaultEnd(next) : next;
    });
  }, []);

  const submitForm = useCallback(async (): Promise<void> => {
    const result = buildCreateBookingPayload(formState);
    if (!result.payload) {
      setFormState((previous) => ({ ...previous, error: result.error ?? 'Formulaire invalide.' }));
      return;
    }
    setIsFormSubmitting(true);
    try {
      await createBooking(result.payload);
      setIsFormOpen(false);
    } catch {
      // Le provider centralise le message utilisateur.
    } finally {
      setIsFormSubmitting(false);
    }
  }, [createBooking, formState]);

  const selectEvent = useCallback((event: CalendarEvent): void => {
    setSelectedBooking(bookings.find(({ id_booking }) => id_booking === event.id) ?? null);
    setIsMoveOpen(false);
    setMoveState(null);
    setIsConfirmingCancellation(false);
  }, [bookings]);

  const closeDetail = useCallback((): void => {
    if (isCancelling) return;
    setSelectedBooking(null);
    setIsConfirmingCancellation(false);
  }, [isCancelling]);

  const openMove = useCallback((): void => {
    if (!selectedBooking) return;
    setMoveState(createBookingMoveFormState(selectedBooking));
    setIsMoveOpen(true);
    setIsConfirmingCancellation(false);
  }, [selectedBooking]);

  const closeMove = useCallback((): void => {
    if (!isMoveSubmitting) setIsMoveOpen(false);
  }, [isMoveSubmitting]);

  const updateMoveField = useCallback(<K extends keyof BookingMoveFormState>(field: K, value: BookingMoveFormState[K]): void => {
    setMoveState((previous) => {
      if (!previous) return previous;
      const next = { ...previous, [field]: value, error: '' };
      return field === 'date' || field === 'heure' || field === 'minute' ? applyBookingDefaultEnd(next) : next;
    });
  }, []);

  const submitMove = useCallback(async (): Promise<void> => {
    if (!selectedBooking || !moveState) return;
    const result = buildMoveBookingPayload(moveState, selectedBooking);
    if (!result.payload) {
      setMoveState((previous) => previous ? { ...previous, error: result.error ?? 'Formulaire invalide.' } : previous);
      return;
    }
    setIsMoveSubmitting(true);
    try {
      await updateBooking(selectedBooking.id_booking, result.payload);
      setIsMoveOpen(false);
      setMoveState(null);
      setSelectedBooking(null);
    } catch {
      // Le provider centralise le message utilisateur.
    } finally {
      setIsMoveSubmitting(false);
    }
  }, [moveState, selectedBooking, updateBooking]);

  const cancelSelectedBooking = useCallback(async (): Promise<void> => {
    if (!selectedBooking) return;
    setIsCancelling(true);
    try {
      await cancelBooking(selectedBooking.id_booking);
      setSelectedBooking(null);
      setIsConfirmingCancellation(false);
    } catch {
      // Le provider centralise le message utilisateur.
    } finally {
      setIsCancelling(false);
    }
  }, [cancelBooking, selectedBooking]);

  const detailPresentation = selectedBooking
    ? getBookingDetailPresentation(selectedBooking)
    : { dateLabel: '', employeeLabel: '', timeLabel: '' };
  const beneficiaryLabel = selectedBooking?.beneficiaire
    ? `${selectedBooking.beneficiaire.prenom} ${selectedBooking.beneficiaire.nom.toUpperCase()}`
    : selectedBooking ? `Bénéficiaire #${selectedBooking.id_beneficiaire}` : '';

  return {
    currentDateInput: formatBookingDateInput(currentDate),
    currentView,
    detail: {
      booking: isMoveOpen ? null : selectedBooking,
      cancel: cancelSelectedBooking,
      close: closeDetail,
      ...detailPresentation,
      isCancelling,
      isConfirming: isConfirmingCancellation,
      move: openMove,
      rejectCancellation: () => setIsConfirmingCancellation(false),
      requestCancellation: () => setIsConfirmingCancellation(true),
    },
    form: {
      close: closeForm,
      employees: employes,
      hourOptions: BOOKING_HOUR_OPTIONS,
      isOpen: isFormOpen,
      isSubmitting: isFormSubmitting,
      loadingEmployees: loadingEmployes,
      minuteOptions: BOOKING_MINUTE_OPTIONS,
      portalTarget: typeof document === 'undefined' ? undefined : document.body,
      state: formState,
      submit: submitForm,
      today,
      updateField: updateFormField,
    },
    isLoading,
    month: {
      navigate: (direction) => setCurrentDate((previous) => shiftBookingMonth(previous, direction)),
      selectDay: (date) => openForm(formatBookingDateInput(date)),
      selectEvent,
      view: monthView,
      weekdays: BOOKING_WEEKDAYS,
    },
    move: {
      beneficiaryLabel,
      close: closeMove,
      hourOptions: BOOKING_HOUR_OPTIONS,
      isOpen: isMoveOpen && Boolean(selectedBooking),
      isSubmitting: isMoveSubmitting,
      minuteOptions: BOOKING_MINUTE_OPTIONS,
      portalTarget: typeof document === 'undefined' ? undefined : document.body,
      state: moveState,
      submit: submitMove,
      today,
      updateField: updateMoveField,
    },
    openNewBooking: () => openForm(),
    setCurrentDate: (value) => {
      const parsed = parseBookingDateJump(value);
      if (parsed) setCurrentDate(parsed);
    },
    setCurrentView,
    week: {
      navigate: (direction) => setCurrentDate((previous) => shiftBookingWeek(previous, direction)),
      selectEvent,
      selectSlot: (date, hour) => openForm(`${formatBookingDateInput(date)} ${String(hour).padStart(2, '0')}:00`),
      startHour: BOOKING_START_HOUR,
      view: weekView,
    },
  };
}
