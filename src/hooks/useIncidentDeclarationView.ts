import { useCallback, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateIncidentResult, IncidentImpactUtilisateurs } from '../utils/types/index.ts';
import type { IncidentDeclarationFormState } from '../utils/scripts/index.ts';
import {
  applyIncidentImpactedUsers,
  buildIncidentDeclarationPayload,
  buildIncidentEmployeeOptions,
  createIncidentDeclarationInitialForm,
} from '../utils/scripts/index.ts';
import { useEmployes } from './useEmployes.ts';
import { useIncident } from './useIncidents.ts';
import { useNotifications } from './useNotifications.ts';

export function useIncidentDeclarationView() {
  const navigate = useNavigate();
  const { employes } = useEmployes();
  const { refreshNotifications } = useNotifications();
  const { create } = useIncident();
  const [form, setForm] = useState<IncidentDeclarationFormState>(createIncidentDeclarationInitialForm);
  const [createdResult, setCreatedResult] = useState<CreateIncidentResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const employeeOptions = useMemo(() => buildIncidentEmployeeOptions(employes), [employes]);

  const updateField = useCallback(<Key extends keyof IncidentDeclarationFormState>(field: Key, value: IncidentDeclarationFormState[Key]): void => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setError(null);
  }, []);
  const updateImpactedUsers = useCallback((value: IncidentImpactUtilisateurs): void => {
    setForm((previous) => applyIncidentImpactedUsers(previous, value));
    setError(null);
  }, []);
  const navigateBack = useCallback((): void => { void navigate('/incidents'); }, [navigate]);
  const navigateToCreatedIncident = useCallback((): void => {
    if (createdResult) void navigate(`/incidents/traitement/${createdResult.incident.id_incident}`);
  }, [createdResult, navigate]);
  const submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const result = buildIncidentDeclarationPayload(form);
    if (!result.payload) { setError(result.error); return; }
    setIsSaving(true);
    const created = await create(result.payload);
    setIsSaving(false);
    if (!created) return;
    setCreatedResult(created);
    setForm(createIncidentDeclarationInitialForm());
    await refreshNotifications();
  }, [create, form, refreshNotifications]);

  return {
    createdResult,
    employeeOptions,
    error,
    form,
    isSaving,
    navigateBack,
    navigateToCreatedIncident,
    submit,
    updateField,
    updateImpactedUsers,
  };
}

export type IncidentDeclarationViewModel = ReturnType<typeof useIncidentDeclarationView>;
