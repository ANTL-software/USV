import { useState, useCallback, useEffect } from 'react';
import { getAllProspectsService } from '../API/services/prospect.service';
import { getProspectsCampagneService } from '../API/services/queue.service';
import type { Prospect, ProspectFilters } from '../utils/types/prospect.types';
import type { ProspectCampagneRow } from '../utils/types/queue.types';
import type { Campagne } from '../utils/types/campagne.types';

export interface UseProspectsReturn {
  prospects: Prospect[];
  pagination: { page: number; limit: number; total: number; totalPages: number } | null;
  isLoading: boolean;
  error: string | null;
  campagnes: Campagne[];
  selectedCampagne: Campagne | null;
  setSelectedCampagne: (c: Campagne | null) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  search: string;
  setSearch: (s: string) => void;
  refresh: () => void;
}

const PROSPECTS_PER_PAGE = 25;

const mapProspectCampagneRowToProspect = (row: ProspectCampagneRow): Prospect => ({
  id_prospect: row.prospect.id_prospect,
  type_prospect: 'Particulier',
  nom: row.prospect.nom,
  prenom: row.prospect.prenom,
  raison_sociale: null,
  email: row.prospect.email,
  telephone: row.prospect.telephone,
  type_telephone: 'inconnu',
  adresse: null,
  code_postal: row.prospect.code_postal,
  ville: row.prospect.ville,
  pays: null,
  statut: row.prospect.statut as Prospect['statut'],
  siret: null,
  code_naf: null,
  activite: null,
  secteur: null,
  region: null,
  civilite: null,
  telephone_contact: null,
  est_doublon: false,
  optout: false,
  doublon_date: null,
  optout_date: null,
  doublon_signale_par: null,
  optout_signale_par: null,
  created_at: row.date_injection,
  updated_at: row.date_injection,
});

export const useProspects = (campagnes: Campagne[]): UseProspectsReturn => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampagne, setSelectedCampagne] = useState<Campagne | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (selectedCampagne) {
        const result = await getProspectsCampagneService(selectedCampagne.id_campagne, {
          page: currentPage,
          limit: PROSPECTS_PER_PAGE,
          search: search || undefined,
        });
        const mappedProspects = result.data.map(mapProspectCampagneRowToProspect);
        setProspects(mappedProspects);
        setPagination(result.pagination);
      } else {
        const filters: ProspectFilters = {
          page: currentPage,
          limit: PROSPECTS_PER_PAGE,
          search: search || undefined,
        };
        const result = await getAllProspectsService(filters);
        setProspects(result.data);
        setPagination(result.pagination);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du chargement des prospects';
      setError(msg);
      setProspects([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCampagne, currentPage, search, refreshKey]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSetPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSetSearch = useCallback((s: string) => {
    setSearch(s);
    setCurrentPage(1);
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return {
    prospects,
    pagination,
    isLoading,
    error,
    campagnes,
    selectedCampagne,
    setSelectedCampagne,
    currentPage: pagination?.page ?? 1,
    setCurrentPage: handleSetPage,
    search,
    setSearch: handleSetSearch,
    refresh,
  };
};
