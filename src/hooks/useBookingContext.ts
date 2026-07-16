import { useContext } from 'react';
import { BookingContext } from '../context/booking/index.ts';
import type { BookingContextType } from '../context/booking/index.ts';

export const useBookingContext = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
};
