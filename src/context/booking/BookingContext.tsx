import { createContext } from 'react';
import type { BookingModel } from '../../API/models/booking.model.ts';
import type { CreateBookingPayload, BookingFilters } from '../../utils/types/booking.types.ts';
import type { UpdateBookingPayload } from '../../API/services/booking.service.ts';

export interface EmployeOption {
  value: number;
  label: string;
}

export interface BookingContextType {
  bookings: BookingModel[];
  employes: EmployeOption[];
  isLoading: boolean;
  loadingEmployes: boolean;
  fetchBookings: (filters?: BookingFilters) => Promise<void>;
  createBooking: (payload: CreateBookingPayload) => Promise<void>;
  updateBooking: (id: number, payload: UpdateBookingPayload) => Promise<void>;
  cancelBooking: (id: number) => Promise<void>;
}

export const BookingContext = createContext<BookingContextType | undefined>(undefined);
