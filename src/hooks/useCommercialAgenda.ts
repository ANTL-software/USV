import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { View } from 'react-big-calendar';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  cancelCommercialAgendaRendezVousService,
  getCommercialAgendaAgentsService,
  getCommercialAgendaService,
  updateCommercialAgendaRendezVousService,
} from '../API/services/index.ts';
import {
  buildCommercialAgendaPresentation,
  buildCommercialAgendaUpdatePayload,
  createCommercialAgendaEditForm,
  getCommercialAgendaAppearance,
  getCommercialAgendaErrorMessage,
  toCommercialAgendaAgentOption,
  toCommercialAgendaEvent,
} from '../utils/scripts/index.ts';
import type {
  CommercialAgendaAgent,
  CommercialAgendaAgentOption,
  CommercialAgendaEditForm,
  CommercialAgendaEvent,
  RendezVousItem,
} from '../utils/types/index.ts';
import { useAlert } from './useAlert.ts';

export function useCommercialAgenda() {
  const navigate = useNavigate();
  const { showConfirm, showError, showSuccess } = useAlert();
  const [commercials, setCommercials] = useState<CommercialAgendaAgent[]>([]);
  const [selectedCommercialId, setSelectedCommercialId] = useState<number | null>(null);
  const [rendezVous, setRendezVous] = useState<RendezVousItem[]>([]);
  const [isLoadingCommercials, setIsLoadingCommercials] = useState(true);
  const [isLoadingAgenda, setIsLoadingAgenda] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>('week');
  const [selectedRendezVous, setSelectedRendezVous] = useState<RendezVousItem | null>(null);
  const [editForm, setEditForm] = useState<CommercialAgendaEditForm | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const agendaRequestSequence = useRef(0);

  const loadCommercials = useCallback(async (): Promise<void> => {
    setIsLoadingCommercials(true);
    setLoadError(null);
    try {
      const result = await getCommercialAgendaAgentsService();
      setCommercials(result);
      setSelectedCommercialId((current) => (
        current && result.some(({ id_employe }) => id_employe === current)
          ? current
          : result[0]?.id_employe ?? null
      ));
    } catch (error) {
      const message = getCommercialAgendaErrorMessage(error, 'Impossible de charger les commerciaux.');
      setLoadError(message);
      await showError(message);
    } finally {
      setIsLoadingCommercials(false);
    }
  }, [showError]);

  const loadAgenda = useCallback(async (): Promise<void> => {
    const idAgent = selectedCommercialId;
    const requestSequence = agendaRequestSequence.current + 1;
    agendaRequestSequence.current = requestSequence;
    if (!idAgent) {
      setRendezVous([]);
      return;
    }
    setIsLoadingAgenda(true);
    setLoadError(null);
    try {
      const result = await getCommercialAgendaService(idAgent);
      if (agendaRequestSequence.current === requestSequence) setRendezVous(result);
    } catch (error) {
      if (agendaRequestSequence.current !== requestSequence) return;
      const message = getCommercialAgendaErrorMessage(error, 'Impossible de charger l’agenda du commercial.');
      setLoadError(message);
      setRendezVous([]);
      await showError(message);
    } finally {
      if (agendaRequestSequence.current === requestSequence) setIsLoadingAgenda(false);
    }
  }, [selectedCommercialId, showError]);

  useEffect(() => {
    void loadCommercials();
  }, [loadCommercials]);

  useEffect(() => {
    void loadAgenda();
    setSelectedRendezVous(null);
    setEditForm(null);
  }, [loadAgenda]);

  const commercialOptions = useMemo(
    () => commercials.map(toCommercialAgendaAgentOption),
    [commercials],
  );
  const selectedCommercial = useMemo(
    () => commercials.find(({ id_employe }) => id_employe === selectedCommercialId) ?? null,
    [commercials, selectedCommercialId],
  );
  const selectedCommercialOption = useMemo(
    () => commercialOptions.find(({ value }) => value === selectedCommercialId) ?? null,
    [commercialOptions, selectedCommercialId],
  );
  const events = useMemo(
    () => rendezVous
      .filter(({ statut }) => statut !== 'annule' && statut !== 'effectue')
      .map(toCommercialAgendaEvent),
    [rendezVous],
  );
  const selectedPresentation = useMemo(
    () => selectedRendezVous ? buildCommercialAgendaPresentation(selectedRendezVous) : null,
    [selectedRendezVous],
  );

  const selectCommercial = useCallback((option: CommercialAgendaAgentOption | null): void => {
    agendaRequestSequence.current += 1;
    setRendezVous([]);
    setSelectedRendezVous(null);
    setEditForm(null);
    setSelectedCommercialId(option?.value ?? null);
  }, []);

  const selectEvent = useCallback((event: CommercialAgendaEvent): void => {
    setSelectedRendezVous(event.resource);
    setEditForm(null);
  }, []);

  const closeDetails = useCallback((): void => {
    if (!isSubmitting) setSelectedRendezVous(null);
  }, [isSubmitting]);

  const openEdit = useCallback((): void => {
    if (!selectedRendezVous || !buildCommercialAgendaPresentation(selectedRendezVous).editable) return;
    setEditForm(createCommercialAgendaEditForm(selectedRendezVous));
  }, [selectedRendezVous]);

  const closeEdit = useCallback((): void => {
    if (!isSubmitting) setEditForm(null);
  }, [isSubmitting]);

  const updateEditField = useCallback(<K extends keyof CommercialAgendaEditForm>(
    field: K,
    value: CommercialAgendaEditForm[K],
  ): void => {
    setEditForm((current) => current ? { ...current, [field]: value, error: '' } : current);
  }, []);

  const submitEdit = useCallback(async (): Promise<void> => {
    if (!selectedCommercialId || !selectedRendezVous || !editForm) return;
    const result = buildCommercialAgendaUpdatePayload(editForm);
    if (!result.payload) {
      setEditForm((current) => current ? { ...current, error: result.error ?? 'Formulaire invalide.' } : current);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCommercialAgendaRendezVousService(
        selectedCommercialId,
        selectedRendezVous.id_rendez_vous,
        result.payload,
      );
      setEditForm(null);
      setSelectedRendezVous(null);
      await loadAgenda();
      await showSuccess('Le rendez-vous a été modifié sans changer de commercial.');
    } catch (error) {
      const message = getCommercialAgendaErrorMessage(error, 'Impossible de modifier le rendez-vous.');
      setEditForm((current) => current ? { ...current, error: message } : current);
      await showError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [editForm, loadAgenda, selectedCommercialId, selectedRendezVous, showError, showSuccess]);

  const cancelRendezVous = useCallback(async (): Promise<void> => {
    if (!selectedCommercialId || !selectedRendezVous || !selectedPresentation?.editable) return;
    const rendezVousToCancel = selectedRendezVous;
    setSelectedRendezVous(null);
    const confirmed = await showConfirm(
      `Annuler le rendez-vous de ${selectedPresentation.prospectLabel} ? Le commercial d’origine restera inchangé dans l’historique.`,
      'Annuler le rendez-vous',
      'Annuler le rendez-vous',
      'Conserver',
    );
    if (!confirmed) {
      setSelectedRendezVous(rendezVousToCancel);
      return;
    }

    setIsSubmitting(true);
    try {
      await cancelCommercialAgendaRendezVousService(selectedCommercialId, rendezVousToCancel.id_rendez_vous);
      setEditForm(null);
      await loadAgenda();
      await showSuccess('Le rendez-vous a été annulé pour le commercial sélectionné.');
    } catch (error) {
      setSelectedRendezVous(rendezVousToCancel);
      await showError(getCommercialAgendaErrorMessage(error, 'Impossible d’annuler le rendez-vous.'));
    } finally {
      setIsSubmitting(false);
    }
  }, [loadAgenda, selectedCommercialId, selectedPresentation, selectedRendezVous, showConfirm, showError, showSuccess]);

  const eventPropGetter = useCallback((event: CommercialAgendaEvent) => {
    const appearance = getCommercialAgendaAppearance(event.resource);
    return {
      className: 'commercialAgenda__event',
      style: {
        backgroundColor: appearance.color,
        border: 'none',
        borderRadius: '6px',
        color: appearance.textColor,
        fontWeight: 600,
        opacity: event.resource.statut === 'non_honore' ? 0.72 : 0.95,
      },
    };
  }, []);

  return {
    calendar: {
      currentDate,
      currentView,
      eventPropGetter,
      events,
      setCurrentDate,
      setCurrentView,
    },
    commercialOptions,
    details: {
      cancel: cancelRendezVous,
      close: closeDetails,
      edit: openEdit,
      isSubmitting,
      presentation: selectedPresentation,
      rendezVous: editForm ? null : selectedRendezVous,
    },
    edit: {
      close: closeEdit,
      form: editForm,
      isSubmitting,
      rendezVous: selectedRendezVous,
      submit: submitEdit,
      today: format(new Date(), 'yyyy-MM-dd'),
      updateField: updateEditField,
    },
    isLoadingAgenda,
    isLoadingCommercials,
    loadError,
    navigateBack: () => void navigate('/commerciaux'),
    refresh: loadAgenda,
    selectCommercial,
    selectEvent,
    selectedCommercial,
    selectedCommercialOption,
  };
}

export type CommercialAgendaViewModel = ReturnType<typeof useCommercialAgenda>;
