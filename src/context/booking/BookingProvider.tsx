import { useState, useCallback, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { BookingContext } from './BookingContext.tsx';
import type { EmployeOption } from './BookingContext.tsx';
import { UserContext } from '../user/UserContext.tsx';
import type { BookingModel } from '../../API/models/booking.model.ts';
import type { CreateBookingPayload, BookingFilters } from '../../utils/types/booking.types.ts';
import {
  getBookingsService,
  createBookingService,
  updateBookingService,
  cancelBookingService,
} from '../../API/services/booking.service.ts';
import type { UpdateBookingPayload } from '../../API/services/booking.service.ts';
import { getAllEmployesService } from '../../API/services/user.service.ts';
import { showError, showSuccess } from '../../utils/services/alertService.ts';
import { logError } from '../../utils/scripts/errorHandling.ts';
import {
  handleBookingLoadError,
  handleBookingCreateError,
  handleBookingUpdateError,
  handleBookingCancelError,
  handleEmployeLoadError,
} from '../../utils/scripts/bookingErrorHandling.ts';

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider = ({ children }: BookingProviderProps) => {
  const userCtx = useContext(UserContext);
  const isAuthenticated = !!userCtx?.user;

  const [bookings, setBookings] = useState<BookingModel[]>([]);
  const [employes, setEmployes] = useState<EmployeOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingEmployes, setLoadingEmployes] = useState<boolean>(true);

  // Chargement des employés uniquement quand l'utilisateur est authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      setEmployes([]);
      setLoadingEmployes(false);
      return;
    }
    setLoadingEmployes(true);
    getAllEmployesService()
      .then(data => {
        const sorted = [...data].sort((a, b) => a.prenom.localeCompare(b.prenom, 'fr'));
        setEmployes(sorted.map(e => e.toSelectOption()));
      })
      .catch(err => {
        logError('BookingProvider.loadEmployes', err);
        showError(handleEmployeLoadError(err), 'Chargement impossible');
      })
      .finally(() => setLoadingEmployes(false));
  }, [isAuthenticated]);

  const fetchBookings = useCallback(async (filters?: BookingFilters): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await getBookingsService(filters);
      setBookings(data);
    } catch (err: unknown) {
      logError('BookingProvider.fetchBookings', err);
      await showError(handleBookingLoadError(err), 'Chargement des réservations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (payload: CreateBookingPayload): Promise<void> => {
    try {
      setIsLoading(true);
      const newBooking = await createBookingService(payload);
      setBookings(prev => [...prev, newBooking]);
      await showSuccess('La réservation a été enregistrée avec succès.', 'Réservation confirmée');
    } catch (err: unknown) {
      logError('BookingProvider.createBooking', err);
      await showError(handleBookingCreateError(err), 'Échec de la réservation');
      throw err; // Permet au composant de savoir qu'il y a eu une erreur (ex: ne pas fermer le formulaire)
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBooking = useCallback(async (id: number, payload: UpdateBookingPayload): Promise<void> => {
    try {
      setIsLoading(true);
      const updated = await updateBookingService(id, payload);
      setBookings(prev => prev.map(b => b.id_booking === id ? updated : b));
      await showSuccess('La réservation a été déplacée avec succès.', 'Réservation déplacée');
    } catch (err: unknown) {
      logError('BookingProvider.updateBooking', err);
      await showError(handleBookingUpdateError(err), 'Échec du déplacement');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      await cancelBookingService(id);
      setBookings(prev => prev.filter(b => b.id_booking !== id));
      await showSuccess('La réservation a été annulée.', 'Réservation annulée');
    } catch (err: unknown) {
      logError('BookingProvider.cancelBooking', err);
      await showError(handleBookingCancelError(err), "Échec de l'annulation");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <BookingContext.Provider value={{ bookings, employes, isLoading, loadingEmployes, fetchBookings, createBooking, updateBooking, cancelBooking }}>
      {children}
    </BookingContext.Provider>
  );
};
