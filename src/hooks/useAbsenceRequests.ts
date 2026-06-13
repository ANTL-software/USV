import { useCallback, useMemo, useState } from 'react';
import { createMyAbsenceRequestService, getMyAbsenceRequestsService } from '../API/services/absence.service';
import { ABSENCE_MOTIFS } from '../utils/constants/absence.constants';
import type { AbsenceRequest, AbsenceRequestType, CreateAbsenceRequestPayload } from '../utils/types/absence.types';

interface AbsenceFormState {
  motif_code: string;
  description: string;
  type_demande: AbsenceRequestType;
  date_debut: string;
  date_fin: string;
  heure_debut: string;
  heure_fin: string;
}

const INITIAL_FORM: AbsenceFormState = {
  motif_code: '',
  description: '',
  type_demande: 'jours',
  date_debut: '',
  date_fin: '',
  heure_debut: '',
  heure_fin: '',
};

export const useAbsenceRequests = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [form, setForm] = useState<AbsenceFormState>(INITIAL_FORM);
  const [requests, setRequests] = useState<AbsenceRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const selectedMotif = useMemo(
    () => ABSENCE_MOTIFS.find((motif) => motif.value === form.motif_code) ?? null,
    [form.motif_code]
  );

  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
    setFormError(null);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setForm(INITIAL_FORM);
    setFormError(null);
  }, []);

  const openListModal = useCallback(async () => {
    setIsListModalOpen(true);
    setIsLoadingList(true);
    setListError(null);

    try {
      const data = await getMyAbsenceRequestsService();
      setRequests(data);
    } catch (error) {
      setListError(error instanceof Error ? error.message : 'Impossible de charger vos demandes');
      setRequests([]);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  const closeListModal = useCallback(() => {
    setIsListModalOpen(false);
    setListError(null);
  }, []);

  const updateField = useCallback((field: keyof AbsenceFormState, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'type_demande' && value === 'jours') {
        next.heure_debut = '';
        next.heure_fin = '';
      }
      if (field === 'date_debut' && prev.type_demande === 'heures') {
        next.date_fin = value;
      }
      return next;
    });
    setFormError(null);
  }, []);

  const submitRequest = useCallback(async () => {
    if (!selectedMotif) {
      setFormError('Le motif est requis');
      return false;
    }

    if (!form.description.trim()) {
      setFormError('Le détail de la demande est requis');
      return false;
    }

    if (!form.date_debut || !form.date_fin) {
      setFormError('Les dates sont requises');
      return false;
    }

    if (form.type_demande === 'heures' && (!form.heure_debut || !form.heure_fin)) {
      setFormError('Les horaires sont requis pour une absence horaire');
      return false;
    }

    const payload: CreateAbsenceRequestPayload = {
      motif_code: selectedMotif.value,
      motif_label: selectedMotif.label,
      description: form.description.trim(),
      type_demande: form.type_demande,
      date_debut: form.date_debut,
      date_fin: form.type_demande === 'heures' ? form.date_debut : form.date_fin,
      heure_debut: form.type_demande === 'heures' ? form.heure_debut : null,
      heure_fin: form.type_demande === 'heures' ? form.heure_fin : null,
      justificatif_requis: selectedMotif.justificatif_requis,
    };

    try {
      setIsSubmitting(true);
      setFormError(null);
      const createdRequest = await createMyAbsenceRequestService(payload);
      setRequests((prev) => [createdRequest, ...prev]);
      closeCreateModal();
      return true;
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Impossible d\'envoyer votre demande');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [closeCreateModal, form, selectedMotif]);

  return {
    isCreateModalOpen,
    isListModalOpen,
    form,
    requests,
    isSubmitting,
    isLoadingList,
    formError,
    listError,
    selectedMotif,
    openCreateModal,
    closeCreateModal,
    openListModal,
    closeListModal,
    updateField,
    submitRequest,
  };
};
