import { createContext } from 'react';
import type { BookingModel } from '../../API/models/booking.model.ts';
import type { CreateBookingPayload, BookingFilters, BookingConfig, UpdateBookingPayload } from '../../utils/types/booking.types.ts';

export interface EmployeOption {
  value: number;
  label: string;
}

export interface BookingContextType {
  bookings: BookingModel[];
  employes: EmployeOption[];
  config: BookingConfig | null;
  isLoading: boolean;
  loadingEmployes: boolean;
  fetchBookings: (filters?: BookingFilters) => Promise<void>;
  createBooking: (payload: CreateBookingPayload) => Promise<void>;
  updateBooking: (id: number, payload: UpdateBookingPayload) => Promise<void>;
  cancelBooking: (id: number) => Promise<void>;
}

export const BookingContext = createContext<BookingContextType | undefined>(undefined);
