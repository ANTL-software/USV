import { useCallback, useEffect, useState } from 'react';
import {
  addIncidentCommentaireService,
  createIncidentService,
  getIncidentByIdService,
  getIncidentsService,
  qualifierIncidentService,
  traiterIncidentService,
} from '../API/services/incident.service';
import { showError } from '../utils/services/alertService';
import type {
  AddIncidentCommentairePayload,
  CreateIncidentPayload,
  Incident,
  IncidentFilters,
  IncidentPagination,
  QualifierIncidentPayload,
  TraiterIncidentPayload,
} from '../utils/types/incident.types';

const DEFAULT_PAGINATION: IncidentPagination = {
  page: 1,
  limit: 25,
  total: 0,
  totalPages: 1,
};

export function useIncidents(initialFilters: IncidentFilters = {}) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [pagination, setPagination] = useState<IncidentPagination>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IncidentFilters>({ page: 1, limit: 25, ...initialFilters });

  const load = useCallback(async (nextFilters: IncidentFilters = filters) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getIncidentsService(nextFilters);
      setIncidents(result.incidents);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des incidents');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load(filters);
  }, [filters, load]);

  const updateFilters = useCallback((next: IncidentFilters) => {
    setFilters(prev => ({ ...prev, ...next, page: next.page ?? 1 }));
  }, []);

  const refresh = useCallback(() => load(filters), [filters, load]);

  return {
    incidents,
    pagination,
    isLoading,
    error,
    filters,
    setFilters: updateFilters,
    refresh,
  };
}

export function useIncident(id?: number) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (incidentId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      setIncident(await getIncidentByIdService(incidentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement de l'incident");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) load(id);
  }, [id, load]);

  const create = useCallback(async (payload: CreateIncidentPayload): Promise<Incident | null> => {
    try {
      return await createIncidentService(payload);
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur lors de la déclaration', 'Erreur');
      return null;
    }
  }, []);

  const qualify = useCallback(async (incidentId: number, payload: QualifierIncidentPayload): Promise<Incident | null> => {
    try {
      const updated = await qualifierIncidentService(incidentId, payload);
      setIncident(updated);
      return updated;
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur lors de la qualification', 'Erreur');
      return null;
    }
  }, []);

  const treat = useCallback(async (incidentId: number, payload: TraiterIncidentPayload): Promise<Incident | null> => {
    try {
      const updated = await traiterIncidentService(incidentId, payload);
      setIncident(updated);
      return updated;
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur lors du traitement', 'Erreur');
      return null;
    }
  }, []);

  const addComment = useCallback(async (incidentId: number, payload: AddIncidentCommentairePayload): Promise<boolean> => {
    try {
      await addIncidentCommentaireService(incidentId, payload);
      await load(incidentId);
      return true;
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur lors de l’ajout du commentaire', 'Erreur');
      return false;
    }
  }, [load]);

  return {
    incident,
    isLoading,
    error,
    load,
    create,
    qualify,
    treat,
    addComment,
  };
}
