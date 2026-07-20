import { createContext } from 'react';
import type { BookingModel } from '../../API/models/index.ts';
import type { BookingConfig, BookingFilters, CreateBookingPayload, EmployeOption, UpdateBookingPayload } from '../../utils/types/index.ts';

export interface BookingContextType {
  bookings: BookingModel[];
  employes: EmployeOption[];
  config: BookingConfig | null;
  isLoading: boolean;
  loadingEmployes: boolean;
  fetchBookings: (filters?: BookingFilters) => Promise<void>;
  fetchConfig: () => Promise<void>;
  createBooking: (payload: CreateBookingPayload) => Promise<void>;
  updateBooking: (id: number, payload: UpdateBookingPayload) => Promise<void>;
  cancelBooking: (id: number) => Promise<void>;
  createEmployeOption: (employe: { id_employe: number; nom: string; prenom: string; }) => EmployeOption;
}

export const BookingContext = createContext<BookingContextType | undefined>(undefined);
