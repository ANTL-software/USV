import type { FormEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useEmployes } from './useEmployes.ts';
import { useMarques, useMateriel } from './useMateriel.ts';
import {
  EMPTY_MATERIEL_FORM,
  buildMaterielEmployeOptions,
  buildMaterielForm,
  buildMaterielHistoryRows,
  buildMaterielPayload,
  buildMaterielTableRows,
  getActiveMaterielAffectation,
  getMaterielCountLabel,
} from '../utils/scripts/index.ts';
import type {
  MaterielFormState,
  MaterielModalMode,
} from '../utils/scripts/index.ts';
import type {
  EtatMateriel,
  Materiel,
  MaterielAffectation,
} from '../utils/types/index.ts';

export function useMaterielListView() {
  const navigate = useNavigate();
  const materielStore = useMateriel();
  const { employes } = useEmployes();
  const { marques } = useMarques();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<MaterielModalMode>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MaterielFormState>({ ...EMPTY_MATERIEL_FORM });
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [historique, setHistorique] = useState<MaterielAffectation[]>([]);
  const [isLoadingHistorique, setIsLoadingHistorique] = useState(false);
  const [affectationTarget, setAffectationTarget] = useState<Materiel | null>(null);
  const [selectedEmployeId, setSelectedEmployeId] = useState<number | null>(null);
  const [affectationEtat, setAffectationEtat] = useState<EtatMateriel | null>(null);
  const [affectationNotes, setAffectationNotes] = useState('');
  const [isAffecting, setIsAffecting] = useState(false);
  const [restitutionTarget, setRestitutionTarget] = useState<Materiel | null>(null);
  const [restitutionEtat, setRestitutionEtat] = useState<EtatMateriel | null>(null);
  const [isRestituting, setIsRestituting] = useState(false);

  const tableRows = useMemo(
    () => buildMaterielTableRows(materielStore.materiels),
    [materielStore.materiels],
  );
  const historiqueRows = useMemo(() => buildMaterielHistoryRows(historique), [historique]);
  const employeOptions = useMemo(() => buildMaterielEmployeOptions(employes), [employes]);

  const navigateBack = useCallback((): void => {
    void navigate('/operations');
  }, [navigate]);

  const setFormField = useCallback(<Key extends keyof MaterielFormState>(
    field: Key,
    value: MaterielFormState[Key],
  ): void => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const openCreate = useCallback((): void => {
    setForm({ ...EMPTY_MATERIEL_FORM });
    setShowPassword(false);
    setModalMode('create');
    setEditingId(null);
    setHistorique([]);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback(async (materiel: Materiel): Promise<void> => {
    setForm(buildMaterielForm(materiel));
    setShowPassword(false);
    setModalMode('edit');
    setEditingId(materiel.id_materiel);
    setHistorique([]);
    setModalOpen(true);
    setIsLoadingHistorique(true);
    try {
      setHistorique(await materielStore.fetchHistorique(materiel.id_materiel));
    } catch {
      setHistorique([]);
    } finally {
      setIsLoadingHistorique(false);
    }
  }, [materielStore]);

  const closeMaterielModal = useCallback((): void => setModalOpen(false), []);
  const togglePassword = useCallback((): void => setShowPassword((current) => !current), []);

  const handleSubmit = useCallback(async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!form.nom_machine.trim()) return;
    setIsSaving(true);
    const payload = buildMaterielPayload(form);
    const success = modalMode === 'create'
      ? await materielStore.create(payload)
      : editingId !== null && await materielStore.update(editingId, payload);
    setIsSaving(false);
    if (success) setModalOpen(false);
  }, [editingId, form, materielStore, modalMode]);

  const openAffectation = useCallback((materiel: Materiel): void => {
    setAffectationTarget(materiel);
    setSelectedEmployeId(null);
    setAffectationEtat(null);
    setAffectationNotes('');
  }, []);
  const closeAffectation = useCallback((): void => setAffectationTarget(null), []);
  const handleAffecter = useCallback(async (): Promise<void> => {
    if (!affectationTarget || !selectedEmployeId || !affectationEtat) return;
    setIsAffecting(true);
    const success = await materielStore.affecter(affectationTarget.id_materiel, {
      id_employe: selectedEmployeId,
      etat_affectation: affectationEtat,
      notes: affectationNotes.trim() || undefined,
    });
    setIsAffecting(false);
    if (success) setAffectationTarget(null);
  }, [affectationEtat, affectationNotes, affectationTarget, materielStore, selectedEmployeId]);

  const openRestitution = useCallback((materiel: Materiel): void => {
    setRestitutionTarget(materiel);
    setRestitutionEtat(null);
  }, []);
  const closeRestitution = useCallback((): void => setRestitutionTarget(null), []);
  const handleRestituer = useCallback(async (): Promise<void> => {
    if (!restitutionTarget || !restitutionEtat) return;
    setIsRestituting(true);
    const success = await materielStore.restituer(restitutionTarget.id_materiel, {
      etat_restitution: restitutionEtat,
    });
    setIsRestituting(false);
    if (success) setRestitutionTarget(null);
  }, [materielStore, restitutionEtat, restitutionTarget]);

  const restitutionEmployeeName = useMemo(() => {
    if (!restitutionTarget) return null;
    const employee = getActiveMaterielAffectation(restitutionTarget)?.employe;
    return employee ? `${employee.prenom} ${employee.nom.toUpperCase()}` : null;
  }, [restitutionTarget]);

  return {
    affectationEtat,
    affectationNotes,
    affectationTarget,
    closeAffectation,
    closeMaterielModal,
    closeRestitution,
    countLabel: getMaterielCountLabel(tableRows.length),
    editingId,
    employeOptions,
    form,
    handleAffecter,
    handleRestituer,
    handleSubmit,
    historiqueRows,
    isAffecting,
    isLoadingHistorique,
    isRestituting,
    isSaving,
    marques,
    materielStore,
    modalMode,
    modalOpen,
    navigateBack,
    openAffectation,
    openCreate,
    openEdit,
    openRestitution,
    restitutionEmployeeName,
    restitutionEtat,
    restitutionTarget,
    selectedEmployeId,
    setAffectationEtat,
    setAffectationNotes,
    setFormField,
    setRestitutionEtat,
    setSelectedEmployeId,
    showPassword,
    tableRows,
    togglePassword,
  };
}

export type MaterielListViewModel = ReturnType<typeof useMaterielListView>;
