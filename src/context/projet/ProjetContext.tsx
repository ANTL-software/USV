import { createContext } from 'react';
import type {
  Projet,
  CreateProjetData,
  UpdateProjetData,
  ProjetMembre,
  AddMembreData,
  ListProjetsFilters,
  ProjetDashboard,
  ProjetStats,
  StatutProjet,
} from '../../utils/types/index.ts';

export interface ProjetContextType {
  // État
  projets: Projet[];
  projetActif: Projet | null;
  dashboard: ProjetDashboard | null;
  membres: ProjetMembre[];
  isLoading: boolean;
  error: string | null;

  // Données paginées
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
  };

  // Actions projets
  listProjets: (filters?: ListProjetsFilters, page?: number, limit?: number) => Promise<void>;
  getProjetById: (id: number) => Promise<Projet>;
  createProjet: (data: CreateProjetData) => Promise<Projet>;
  updateProjet: (id: number, data: UpdateProjetData) => Promise<Projet>;
  deleteProjet: (id: number) => Promise<void>;
  updateStatutProjet: (id: number, statut: StatutProjet) => Promise<void>;

  // Dashboard
  getProjetDashboard: (id: number) => Promise<ProjetDashboard>;
  getProjetStats: (id: number) => Promise<ProjetStats>;

  // Membres
  getMembres: (id: number) => Promise<ProjetMembre[]>;
  addMembre: (id: number, data: AddMembreData) => Promise<ProjetMembre>;
  removeMembre: (id: number, idMembre: number) => Promise<void>;

  // Utilitaires
  setProjetActif: (projet: Projet | null) => void;
  clearError: () => void;
  refreshProjets: () => Promise<void>;
}

export const ProjetContext = createContext<ProjetContextType | undefined>(undefined);
