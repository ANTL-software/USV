import { useContext } from 'react';
import { BookingContext } from '../context/booking/BookingContext.tsx';
import type { BookingContextType } from '../context/booking/BookingContext.tsx';

export const useBookingContext = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
};
