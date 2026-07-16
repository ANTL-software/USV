import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IncidentImpactUtilisateurs } from '../utils/types/index.ts';
import type { IncidentQualificationFormState } from '../utils/scripts/index.ts';
import {
  buildIncidentEmployeeOptions,
  buildIncidentQualificationPayload,
  createIncidentQualificationInitialForm,
  getIncidentQualificationForm,
  getIncidentsToQualify,
  applyIncidentImpactedUsers,
} from '../utils/scripts/index.ts';
import { useEmployes } from './useEmployes.ts';
import { useIncident, useIncidents } from './useIncidents.ts';
import { useNotifications } from './useNotifications.ts';

export function useIncidentQualificationView() {
  const navigate = useNavigate();
  const { employes } = useEmployes();
  const { refreshNotifications } = useNotifications();
  const { error, incidents, isLoading, refresh } = useIncidents({ limit: 100 });
  const { qualify } = useIncident();
  const incidentsToQualify = useMemo(() => getIncidentsToQualify(incidents), [incidents]);
  const employeeOptions = useMemo(() => buildIncidentEmployeeOptions(employes), [employes]);
  const [selectedId, setSelectedId] = useState('');
  const [autoSelectEnabled, setAutoSelectEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<IncidentQualificationFormState>(createIncidentQualificationInitialForm);
  const selectedIncident = useMemo(
    () => incidentsToQualify.find((incident) => String(incident.id_incident) === selectedId) ?? null,
    [incidentsToQualify, selectedId],
  );

  useEffect(() => {
    if (autoSelectEnabled && !selectedId && incidentsToQualify.length > 0) {
      queueMicrotask(() => setSelectedId(String(incidentsToQualify[0].id_incident)));
    }
  }, [autoSelectEnabled, incidentsToQualify, selectedId]);

  useEffect(() => {
    if (!selectedIncident) return;
    const nextForm = getIncidentQualificationForm(selectedIncident);
    queueMicrotask(() => {
      setForm(nextForm);
      setSuccess(null);
      setFormError(null);
    });
  }, [selectedIncident]);

  const updateField = useCallback(<Key extends keyof IncidentQualificationFormState>(
    field: Key,
    value: IncidentQualificationFormState[Key],
  ): void => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setSuccess(null);
    setFormError(null);
  }, []);

  const updateImpactedUsers = useCallback((value: IncidentImpactUtilisateurs): void => {
    setForm((previous) => applyIncidentImpactedUsers(previous, value));
    setSuccess(null);
    setFormError(null);
  }, []);

  const selectIncident = useCallback((incidentId: string): void => {
    setSelectedId(incidentId);
    setAutoSelectEnabled(true);
  }, []);
  const navigateBack = useCallback((): void => { void navigate('/incidents'); }, [navigate]);

  const submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!selectedIncident) return;
    const result = buildIncidentQualificationPayload(form);
    if (!result.payload) {
      setFormError(result.error);
      return;
    }

    setIsSaving(true);
    const updated = await qualify(selectedIncident.id_incident, result.payload);
    setIsSaving(false);
    if (!updated) return;
    setSuccess(`${updated.reference} qualifié.`);
    await refresh();
    await refreshNotifications();
    setSelectedId('');
    setAutoSelectEnabled(false);
  }, [form, qualify, refresh, refreshNotifications, selectedIncident]);

  return {
    employeeOptions,
    error,
    form,
    formError,
    incidentsToQualify,
    isLoading,
    isSaving,
    navigateBack,
    selectedId,
    selectedIncident,
    selectIncident,
    submit,
    success,
    updateField,
    updateImpactedUsers,
  };
}

export type IncidentQualificationViewModel = ReturnType<typeof useIncidentQualificationView>;
