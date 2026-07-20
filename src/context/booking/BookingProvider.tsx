import { useState, useCallback, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { BookingContext } from './BookingContext.tsx';
import type { BookingModel } from '../../API/models/index.ts';
import type { BookingConfig, BookingFilters, CreateBookingPayload, EmployeOption, UpdateBookingPayload } from '../../utils/types/index.ts';
import {
  getBookingsService,
  createBookingService,
  updateBookingService,
  cancelBookingService,
  getBookingConfigService,
  getAllEmployesService,
} from '../../API/services/index.ts';
import { showError, showSuccess } from '../../utils/services/index.ts';
import { logError } from '../../utils/scripts/index.ts';
import {
  handleBookingLoadError,
  handleBookingCreateError,
  handleBookingUpdateError,
  handleBookingCancelError,
  handleEmployeLoadError,
} from '../../utils/scripts/index.ts';
import { UserContext } from '../user/index.ts';

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider = ({ children }: BookingProviderProps) => {
  const userCtx = useContext(UserContext);
  const isAuthenticated = !!userCtx?.user;

  const [bookings, setBookings] = useState<BookingModel[]>([]);
  const [employes, setEmployes] = useState<EmployeOption[]>([]);
  const [config, setConfig] = useState<BookingConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingEmployes, setLoadingEmployes] = useState<boolean>(true);

  // Chargement initial des employés seulement
  useEffect(() => {
    if (!isAuthenticated) {
      setEmployes([]);
      setConfig(null);
      setLoadingEmployes(false);
      return;
    }
    setLoadingEmployes(true);
    getAllEmployesService()
      .then((employes) => {
        const sorted = [...employes].sort((a, b) => a.prenom.localeCompare(b.prenom, 'fr'));
        setEmployes(sorted.map(e => e.toSelectOption()));
      })
      .catch(err => {
        logError('BookingProvider.init', err);
        showError(handleEmployeLoadError(err), 'Chargement impossible');
      })
      .finally(() => setLoadingEmployes(false));
  }, [isAuthenticated]);

  // Chargement de la config à la demande (appelé depuis BookingCalendar)
  const fetchConfig = useCallback(async (): Promise<void> => {
    try {
      const cfg = await getBookingConfigService();
      setConfig(cfg);
    } catch (err: unknown) {
      logError('BookingProvider.fetchConfig', err);
      // Ne pas afficher d'erreur, on utilise la valeur par défaut dans le composant
    }
  }, []);

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
      throw err;
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

  const createEmployeOption = useCallback((employe: { id_employe: number; nom: string; prenom: string; }): EmployeOption => {
    return {
      value: employe.id_employe,
      label: `${employe.prenom} ${employe.nom.toUpperCase()} (Matricule: ${employe.id_employe})`,
    };
  }, []);

  const contextValue = { bookings, employes, config, isLoading, loadingEmployes, fetchBookings, fetchConfig, createBooking, updateBooking, cancelBooking, createEmployeOption };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};
