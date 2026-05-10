import { useState, useCallback, useEffect } from 'react';
import {
  getAllPaniersService,
  createPanierService,
  updatePanierService,
  deletePanierService,
  togglePanierActifService,
} from '../API/services/panier.service';
import { confirm, showError } from '../utils/services/alertService';
import type { Panier, CreatePanierData, UpdatePanierData } from '../utils/types/panier.types';

export function usePaniers() {
  const [paniers, setPaniers] = useState<Panier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllPaniersService({ actif: true });
      setPaniers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des paniers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createPanier = useCallback(async (data: CreatePanierData) => {
    try {
      await createPanierService(data);
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [load]);

  const updatePanier = useCallback(async (id: number, data: UpdatePanierData) => {
    try {
      await updatePanierService(id, data);
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [load]);

  const deletePanier = useCallback(async (id: number, label: string) => {
    if (!await confirm(`Supprimer le panier "${label}" ? Les produits associés seront dissociés.`, 'Confirmation')) return;
    try {
      await deletePanierService(id);
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [load]);

  const toggleActif = useCallback(async (id: number, label: string) => {
    const p = paniers.find(p => p.id_panier === id);
    const newState = !p?.actif;
    const action = newState ? 'activer' : 'désactiver';
    if (!await confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} le panier "${label}" ?`, 'Confirmation')) return;
    try {
      await togglePanierActifService(id);
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [paniers, load]);

  return { paniers, isLoading, error, load, createPanier, updatePanier, deletePanier, toggleActif };
}
