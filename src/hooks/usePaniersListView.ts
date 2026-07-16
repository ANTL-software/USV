import { useCallback, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPanierPayload, createPanierFormState, PANIER_ORIGIN_OPTIONS } from '../utils/scripts/index.ts';
import type { Panier, PanierFormState, PanierOrigin } from '../utils/types/index.ts';
import { usePanierProduits } from './usePanierProduits.ts';
import { usePaniers } from './usePaniers.ts';

export function usePaniersListView() {
  const navigate = useNavigate();
  const panierState = usePaniers();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PanierFormState>(createPanierFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [expandedPanierId, setExpandedPanierId] = useState<number | null>(null);
  const productState = usePanierProduits({ panierId: expandedPanierId });
  const selectedOrigin = useMemo(
    () => PANIER_ORIGIN_OPTIONS.find(({ value }) => value === form.origine) ?? null,
    [form.origine],
  );

  const openCreateForm = useCallback((): void => {
    setEditingId(null);
    setForm(createPanierFormState());
    setFormError(null);
    setShowForm(true);
  }, []);
  const openEditForm = useCallback((panier: Panier): void => {
    setEditingId(panier.id_panier);
    setForm(createPanierFormState(panier));
    setFormError(null);
    setShowForm(true);
  }, []);
  const closeForm = useCallback((): void => { setShowForm(false); setFormError(null); }, []);
  const updateField = useCallback(<Key extends keyof PanierFormState>(field: Key, value: PanierFormState[Key]): void => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setFormError(null);
  }, []);
  const updateOrigin = useCallback((origin: PanierOrigin | null): void => {
    updateField('origine', origin ?? 'Campagne');
  }, [updateField]);
  const submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const result = buildPanierPayload(form);
    if (!result.payload) {
      setFormError(result.error);
      return;
    }
    if (editingId !== null) await panierState.updatePanier(editingId, result.payload);
    else await panierState.createPanier(result.payload);
    setShowForm(false);
  }, [editingId, form, panierState]);
  const togglePanier = useCallback((panierId: number): void => {
    setExpandedPanierId((current) => current === panierId ? null : panierId);
  }, []);
  const navigateBack = useCallback((): void => { void navigate('/produits'); }, [navigate]);
  const navigateToProducts = useCallback((panierId: number): void => { void navigate(`/paniers/${panierId}/produits`); }, [navigate]);

  return {
    ...panierState,
    closeForm,
    editingId,
    expandedPanierId,
    expandedPanierProduits: productState.produits,
    form,
    formError,
    navigateBack,
    navigateToProducts,
    openCreateForm,
    openEditForm,
    produitsError: productState.error,
    produitsLoading: productState.isLoading,
    selectedOrigin,
    showForm,
    submit,
    togglePanier,
    updateField,
    updateOrigin,
  };
}

export type PaniersListViewModel = ReturnType<typeof usePaniersListView>;
