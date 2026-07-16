import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { IncidentTreatmentFormState } from '../utils/scripts/index.ts';
import {
  buildIncidentTreatmentPayload,
  createIncidentTreatmentInitialForm,
  getIncidentTimelineVisibility,
  getIncidentTreatmentForm,
  getOpenIncidents,
  groupIncidentComments,
  hasAccessToSubsection,
} from '../utils/scripts/index.ts';
import { useAlert } from './useAlert.ts';
import { useIncident, useIncidents } from './useIncidents.ts';
import { useUserContext } from './useUserContext.ts';

export function useIncidentTreatmentView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useUserContext();
  const { showConfirm } = useAlert();
  const isReadOnlyHistoryView = Boolean(id);
  const initialId = id ? Number(id) : undefined;
  const {
    incidents,
    isLoading: isLoadingList,
    refresh,
  } = useIncidents({ limit: 100 });
  const {
    addComment,
    error,
    incident,
    isLoading,
    load,
    treat,
  } = useIncident(initialId);
  const [selectedId, setSelectedId] = useState(id ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [commentaireLibre, setCommentaireLibre] = useState('');
  const [form, setForm] = useState<IncidentTreatmentFormState>(createIncidentTreatmentInitialForm);

  const canTraiter = hasAccessToSubsection(user, 'incidents', 'traiter');
  const incidentsOuverts = useMemo(() => getOpenIncidents(incidents), [incidents]);
  const activeIncident = selectedId && incident?.id_incident === Number(selectedId)
    ? incident
    : null;
  const commentGroups = useMemo(() => groupIncidentComments(activeIncident), [activeIncident]);
  const timelineVisibility = useMemo(
    () => activeIncident ? getIncidentTimelineVisibility(activeIncident, commentGroups) : null,
    [activeIncident, commentGroups],
  );

  useEffect(() => {
    if (id) queueMicrotask(() => setSelectedId(id));
  }, [id]);

  useEffect(() => {
    if (selectedId) void load(Number(selectedId));
  }, [load, selectedId]);

  useEffect(() => {
    if (!incident) return;
    const loadedIncident = incident;
    queueMicrotask(() => {
      setForm(getIncidentTreatmentForm(loadedIncident));
      setSuccess(null);
    });
  }, [incident]);

  const updateField = useCallback(<Key extends keyof IncidentTreatmentFormState>(
    field: Key,
    value: IncidentTreatmentFormState[Key],
  ): void => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setSuccess(null);
  }, []);

  const navigateBack = useCallback((): void => {
    void navigate('/incidents');
  }, [navigate]);

  const submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!activeIncident) return;

    if (form.statut === 'resolu' || form.statut === 'annule') {
      const isResolution = form.statut === 'resolu';
      const confirmed = await showConfirm(
        isResolution ? 'Confirmer la résolution de cet incident ?' : 'Confirmer l’annulation de cet incident ?',
        isResolution ? 'Confirmer la résolution' : 'Confirmer l’annulation',
        isResolution ? 'Résoudre' : 'Annuler',
        'Retour',
      );
      if (!confirmed) return;
    }

    setIsSaving(true);
    const updated = await treat(activeIncident.id_incident, buildIncidentTreatmentPayload(form));
    setIsSaving(false);
    if (updated) {
      setSuccess(`${updated.reference} mis à jour.`);
      setSelectedId('');
      await refresh();
    }
  }, [activeIncident, form, refresh, showConfirm, treat]);

  const addFreeComment = useCallback(async (): Promise<void> => {
    if (!activeIncident || !commentaireLibre.trim()) return;
    const added = await addComment(activeIncident.id_incident, {
      commentaire: commentaireLibre.trim(),
      type_commentaire: 'commentaire',
    });
    if (added) setCommentaireLibre('');
  }, [activeIncident, addComment, commentaireLibre]);

  return {
    activeIncident,
    addFreeComment,
    canTraiter,
    commentGroups,
    commentaireLibre,
    error,
    form,
    incidentsOuverts,
    isLoading,
    isLoadingList,
    isReadOnlyHistoryView,
    isSaving,
    navigateBack,
    selectedId,
    setCommentaireLibre,
    setSelectedId,
    submit,
    success,
    timelineVisibility,
    updateField,
  };
}

export type IncidentTreatmentViewModel = ReturnType<typeof useIncidentTreatmentView>;
