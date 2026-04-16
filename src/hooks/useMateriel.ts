import { useState, useCallback, useEffect } from 'react';
import {
  getMaterielService,
  getMaterielHistoriqueService,
  createMaterielService,
  updateMaterielService,
  affecterMaterielService,
  restituerMaterielService,
  getMarquesService,
} from '../API/services/materiel.service';
import { showError } from '../utils/services/alertService';
import type { MaterielModel } from '../API/models/materiel.model';
import type {
  MaterielAffectation,
  CreateMaterielPayload,
  UpdateMaterielPayload,
  AffecterMaterielPayload,
  RestituerMaterielPayload,
} from '../utils/types/materiel.types';

export function useMateriel() {
  const [materiels, setMateriels] = useState<MaterielModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMaterielService();
      setMateriels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du matériel');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fetchHistorique = useCallback(async (id: number): Promise<MaterielAffectation[]> => {
    return getMaterielHistoriqueService(id);
  }, []);

  const create = useCallback(async (payload: CreateMaterielPayload): Promise<boolean> => {
    try {
      await createMaterielService(payload);
      await load();
      return true;
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur lors de la création', 'Erreur');
      return false;
    }
  }, [load]);

  const update = useCallback(async (id: number, payload: UpdateMaterielPayload): Promise<boolean> => {
    try {
      await updateMaterielService(id, payload);
      await load();
      return true;
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour', 'Erreur');
      return false;
    }
  }, [load]);

  const affecter = useCallback(async (id: number, payload: AffecterMaterielPayload): Promise<boolean> => {
    try {
      await affecterMaterielService(id, payload);
      await load();
      return true;
    } catch (err) {
      await showError(err instanceof Error ? err.message : "Erreur lors de l'affectation", 'Erreur');
      return false;
    }
  }, [load]);

  const restituer = useCallback(async (id: number, payload: RestituerMaterielPayload): Promise<boolean> => {
    try {
      await restituerMaterielService(id, payload);
      await load();
      return true;
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur lors de la restitution', 'Erreur');
      return false;
    }
  }, [load]);

  return { materiels, isLoading, error, load, fetchHistorique, create, update, affecter, restituer };
}

export function useMarques() {
  const [marques, setMarques] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMarquesService()
      .then(setMarques)
      .catch(() => setMarques([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { marques, isLoading };
}
