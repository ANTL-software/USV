import { useState, useCallback, useEffect } from 'react';
import { getAllProspectsService } from '../API/services/prospect.service';
import { getProspectsCampagneService } from '../API/services/queue.service';
import type { Prospect, ProspectFilters } from '../utils/types/prospect.types';
import type { ProspectCampagneRow } from '../utils/types/queue.types';
import type { Campagne } from '../utils/types/campagne.types';

export interface UseProspectsReturn {
  prospects: Prospect[];
  pagination: { page: number; limit: number; total: number; totalPages: number } | null;
  totalProspectsDb: number | null;
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
  type_prospect: row.prospect.type_prospect,
  nom: row.prospect.nom,
  prenom: row.prospect.prenom,
  raison_sociale: row.prospect.raison_sociale,
  email: row.prospect.email,
  telephone: row.prospect.telephone,
  type_telephone: row.prospect.type_telephone,
  adresse: row.prospect.adresse,
  code_postal: row.prospect.code_postal,
  ville: row.prospect.ville,
  pays: row.prospect.pays,
  statut: (row.prospect.statut_global ?? row.prospect.statut) as Prospect['statut'],
  statut_global: (row.prospect.statut_global ?? row.prospect.statut) as Prospect['statut'],
  siret: row.prospect.siret,
  code_naf: row.prospect.code_naf,
  activite: row.prospect.activite,
  secteur: row.prospect.secteur,
  region: row.prospect.region,
  civilite: row.prospect.civilite,
  telephone_contact: row.prospect.telephone_contact,
  est_doublon: row.prospect.est_doublon,
  optout: row.prospect.optout,
  doublon_date: null,
  optout_date: null,
  doublon_signale_par: null,
  optout_signale_par: null,
  maturite_commerciale: row.prospect.maturite_commerciale,
  created_at: row.prospect.created_at,
  updated_at: row.prospect.updated_at,
  id_prospection: row.id_prospection,
  statut_campagne: row.statut_file ?? row.statut,
  statut_prospect_campagne: (row.statut_prospect_campagne ?? null) as Prospect['statut_prospect_campagne'],
  statut_file: row.statut_file ?? row.statut,
  nb_tentatives: row.nb_tentatives,
  max_tentatives: row.max_tentatives,
  derniere_tentative: row.derniere_tentative,
  id_agent_assigne: row.id_agent_assigne,
  agent_assigne: row.agentAssignee ? {
    id_employe: row.agentAssignee.id_employe,
    nom: row.agentAssignee.nom,
    prenom: row.agentAssignee.prenom,
  } : (row.prospect.commercialAffecte ? {
    id_employe: row.prospect.commercialAffecte.id_employe,
    nom: row.prospect.commercialAffecte.nom,
    prenom: row.prospect.commercialAffecte.prenom,
  } : null),
  date_injection: row.date_injection,
  date_traitement: row.date_traitement,
});

export const useProspects = (campagnes: Campagne[]): UseProspectsReturn => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  const [totalProspectsDb, setTotalProspectsDb] = useState<number | null>(null);
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
        const mappedData = result.data.map(p => ({
          ...p,
          agent_assigne: p.commercialAffecte ? {
            id_employe: p.commercialAffecte.id_employe,
            nom: p.commercialAffecte.nom,
            prenom: p.commercialAffecte.prenom,
          } : null
        }));
        setProspects(mappedData);
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

  useEffect(() => {
    if (selectedCampagne) {
      setTotalProspectsDb(null);
      return;
    }

    let cancelled = false;

    const loadTotalProspectsDb = async () => {
      try {
        const result = await getAllProspectsService({ page: 1, limit: 1 });
        if (!cancelled) {
          setTotalProspectsDb(result.pagination.total);
        }
      } catch {
        if (!cancelled) {
          setTotalProspectsDb(null);
        }
      }
    };

    loadTotalProspectsDb();

    return () => {
      cancelled = true;
    };
  }, [selectedCampagne, refreshKey]);

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
    totalProspectsDb,
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
