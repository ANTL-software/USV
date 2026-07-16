import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createPlanningService,
  deletePlanningService,
  getPlanningsService,
  updatePlanningService,
} from '../API/services/index.ts';
import type { Planning, PlanningPayload } from '../utils/types/index.ts';
import { confirm } from '../utils/services/index.ts';

type SlotForm = {
  id: string;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
};

type PlanningFormState = {
  code_planning: string;
  nom_planning: string;
  description: string;
  heures_hebdo: string;
  jours_feries_chomes: boolean;
  creneaux: SlotForm[];
};

const DEFAULT_FORM: PlanningFormState = {
  code_planning: '',
  nom_planning: '',
  description: '',
  heures_hebdo: '35',
  jours_feries_chomes: true,
  creneaux: [],
};

const createSlot = (jour = 1): SlotForm => ({
  id: `${jour}-${Math.random().toString(36).slice(2, 9)}`,
  jour_semaine: jour,
  heure_debut: '09:00',
  heure_fin: '17:00',
});

const planningToForm = (planning: Planning): PlanningFormState => ({
  code_planning: planning.code_planning,
  nom_planning: planning.nom_planning,
  description: planning.description || '',
  heures_hebdo: String(planning.heures_hebdo),
  jours_feries_chomes: planning.jours_feries_chomes,
  creneaux: planning.creneaux.map((creneau) => ({
    id: `${creneau.id_creneau}`,
    jour_semaine: creneau.jour_semaine,
    heure_debut: creneau.heure_debut.slice(0, 5),
    heure_fin: creneau.heure_fin.slice(0, 5),
  })),
});

export const usePlanningAdmin = (isOpen: boolean) => {
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPlanningId, setSelectedPlanningId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<PlanningFormState>(DEFAULT_FORM);

  const loadPlannings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const planningList = await getPlanningsService();
      setPlannings(planningList);
      setSelectedPlanningId((current) => {
        if (current === 'new') return current;
        if (current && planningList.some((planning) => planning.id_planning === current)) return current;
        return planningList[0]?.id_planning ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des plannings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    void loadPlannings();
  }, [isOpen, loadPlannings]);

  useEffect(() => {
    if (selectedPlanningId === 'new') {
      return;
    }

    const selectedPlanning = plannings.find((planning) => planning.id_planning === selectedPlanningId);
    if (selectedPlanning) {
      setForm(planningToForm(selectedPlanning));
    } else if (plannings.length > 0) {
      setForm(planningToForm(plannings[0]));
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [plannings, selectedPlanningId]);

  const selectedPlanning = useMemo(
    () => plannings.find((planning) => planning.id_planning === selectedPlanningId) ?? null,
    [plannings, selectedPlanningId]
  );
  const isCreating = selectedPlanningId === 'new';

  const startCreate = useCallback(() => {
    setSelectedPlanningId('new');
    setError(null);
    setSuccess(null);
    setForm({
      ...DEFAULT_FORM,
      creneaux: [createSlot(1)],
    });
  }, []);

  const selectPlanning = useCallback((planningId: number) => {
    setSelectedPlanningId(planningId);
    setError(null);
    setSuccess(null);
  }, []);

  const updateField = useCallback((field: keyof Omit<PlanningFormState, 'creneaux'>, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const addSlot = useCallback((jour_semaine: number) => {
    setForm((prev) => ({
      ...prev,
      creneaux: [...prev.creneaux, createSlot(jour_semaine)],
    }));
    setError(null);
  }, []);

  const updateSlot = useCallback((slotId: string, field: keyof Omit<SlotForm, 'id'>, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      creneaux: prev.creneaux.map((slot) => (slot.id === slotId ? { ...slot, [field]: value } : slot)),
    }));
    setError(null);
  }, []);

  const removeSlot = useCallback((slotId: string) => {
    setForm((prev) => ({
      ...prev,
      creneaux: prev.creneaux.filter((slot) => slot.id !== slotId),
    }));
    setError(null);
  }, []);

  const toPayload = useCallback((): PlanningPayload => ({
    code_planning: form.code_planning.trim(),
    nom_planning: form.nom_planning.trim(),
    description: form.description.trim() || null,
    heures_hebdo: Number(form.heures_hebdo),
    jours_feries_chomes: form.jours_feries_chomes,
    creneaux: form.creneaux.map((slot, index) => ({
      jour_semaine: Number(slot.jour_semaine),
      heure_debut: slot.heure_debut.length === 5 ? `${slot.heure_debut}:00` : slot.heure_debut,
      heure_fin: slot.heure_fin.length === 5 ? `${slot.heure_fin}:00` : slot.heure_fin,
      ordre_affichage: index + 1,
    })),
  }), [form]);

  const savePlanning = useCallback(async () => {
    if (!form.code_planning.trim() || !form.nom_planning.trim()) {
      setError('Le code et le nom du planning sont requis');
      return;
    }

    if (form.creneaux.length === 0) {
      setError('Ajoute au moins un créneau');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const payload = toPayload();
      let savedPlanning: Planning;

      if (selectedPlanningId === 'new' || !selectedPlanningId) {
        savedPlanning = await createPlanningService(payload);
        setSuccess('Planning créé avec succès.');
      } else {
        savedPlanning = await updatePlanningService(selectedPlanningId, payload);
        setSuccess('Planning mis à jour avec succès.');
      }

      await loadPlannings();
      setSelectedPlanningId(savedPlanning.id_planning);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’enregistrement');
    } finally {
      setIsSaving(false);
    }
  }, [form.code_planning, form.creneaux.length, form.nom_planning, loadPlannings, selectedPlanningId, toPayload]);

  const deletePlanning = useCallback(async () => {
    if (!selectedPlanning) return;
    if (!await confirm(`Supprimer le planning "${selectedPlanning.nom_planning}" ?`, 'Confirmation')) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      await deletePlanningService(selectedPlanning.id_planning);
      setSuccess('Planning supprimé avec succès.');
      setSelectedPlanningId(null);
      await loadPlannings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setIsSaving(false);
    }
  }, [loadPlannings, selectedPlanning]);

  return {
    plannings,
    selectedPlanningId,
    selectedPlanning,
    isCreating,
    form,
    isLoading,
    isSaving,
    error,
    success,
    startCreate,
    selectPlanning,
    updateField,
    addSlot,
    updateSlot,
    removeSlot,
    savePlanning,
    deletePlanning,
  };
};
