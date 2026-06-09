import { createContext } from 'react';
import type { Vente, VenteListParams, VenteStats } from '../../utils/types/vente.types.ts';

export interface VentePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VenteContextType {
  ventes: Vente[];
  pagination: VentePagination | null;
  isLoading: boolean;
  error: string | null;
  filters: VenteListParams;
  setFilters: (filters: Partial<VenteListParams>) => void;
  load: () => void;
  resetFilters: () => void;
  stats: VenteStats | null;
}

export const VenteContext = createContext<VenteContextType | undefined>(undefined);

