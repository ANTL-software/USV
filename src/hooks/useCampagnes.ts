import { useState, useCallback, useEffect } from 'react';
import {
  getAllCampagnesService,
  updateStatutCampagneService,
  getAgentsCampagneService,
  addAgentCampagneService,
  removeAgentCampagneService,
  transfererAgentService,
} from '../API/services/campagne.service';
import {
  getCampagneProduitsService,
  addProduitCampagneService,
  updateProduitCampagneService,
  removeProduitCampagneService,
} from '../API/services/produit.service';
import { confirm, showError } from '../utils/services/alertService';
import type { Campagne, AgentAffecte, AddAgentCampagneData, StatutCampagne } from '../utils/types/campagne.types';
import type { CampagneProduit, AddProduitCampagneData, UpdateProduitCampagneData } from '../utils/types/produit.types';

export function useCampagnes() {
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllCampagnesService();
      setCampagnes(data.map(m => m.toJSON()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des campagnes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const changerStatut = useCallback(async (id: number, statut: StatutCampagne, nom: string) => {
    const label = statut === 'active' ? 'activer' : statut === 'terminee' ? 'terminer' : 'désactiver';
    if (!await confirm(`Voulez-vous ${label} la campagne "${nom}" ?`, 'Confirmation')) return;
    try {
      await updateStatutCampagneService(id, statut);
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [load]);

  return { campagnes, isLoading, error, load, changerStatut };
}

export function useCampagneAgents(idCampagne: number | null) {
  const [agents, setAgents] = useState<AgentAffecte[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transferEnCours, setTransferEnCours] = useState<number | null>(null); // id_employe en cours de transfert

  const load = useCallback(async () => {
    if (!idCampagne) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAgentsCampagneService(idCampagne);
      setAgents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des agents');
    } finally {
      setIsLoading(false);
    }
  }, [idCampagne]);

  useEffect(() => { load(); }, [load]);

  const addAgent = useCallback(async (data: AddAgentCampagneData) => {
    if (!idCampagne) return;
    try {
      await addAgentCampagneService(idCampagne, data);
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [idCampagne, load]);

  const removeAgent = useCallback(async (idEmploye: number, nom: string) => {
    if (!idCampagne) return;
    if (!await confirm(`Retirer ${nom} de cette campagne ?`, 'Confirmation')) return;
    try {
      await removeAgentCampagneService(idCampagne, idEmploye);
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [idCampagne, load]);

  const transferAgent = useCallback(async (idEmploye: number, idCampagneDestination: number, nom: string, nomDest: string) => {
    if (!idCampagne) return;
    if (!await confirm(`Transférer ${nom} vers "${nomDest}" ?`, 'Confirmer le transfert')) return;
    try {
      await transfererAgentService(idCampagne, idEmploye, { id_campagne_destination: idCampagneDestination });
      setTransferEnCours(null);
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [idCampagne, load]);

  return { agents, isLoading, error, addAgent, removeAgent, transferAgent, transferEnCours, setTransferEnCours };
}

export function useCampagneProduits(idCampagne: number | null) {
  const [produits, setProduits] = useState<CampagneProduit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!idCampagne) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCampagneProduitsService(idCampagne);
      setProduits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
    } finally {
      setIsLoading(false);
    }
  }, [idCampagne]);

  useEffect(() => { load(); }, [load]);

  const addProduit = useCallback(async (data: AddProduitCampagneData) => {
    if (!idCampagne) return;
    try {
      await addProduitCampagneService(idCampagne, data);
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [idCampagne, load]);

  const updateArgumentaire = useCallback(async (idProduit: number, data: UpdateProduitCampagneData) => {
    if (!idCampagne) return;
    try {
      await updateProduitCampagneService(idCampagne, idProduit, data);
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [idCampagne, load]);

  const removeProduit = useCallback(async (idProduit: number, nom: string) => {
    if (!idCampagne) return;
    if (!await confirm(`Retirer "${nom}" de cette campagne ?`, 'Confirmation')) return;
    try {
      await removeProduitCampagneService(idCampagne, idProduit);
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [idCampagne, load]);

  return { produits, isLoading, error, addProduit, updateArgumentaire, removeProduit };
}
