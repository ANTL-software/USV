import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createPartenaireExterneService,
  getAllCampagnesService,
  getPartenairesExternesService,
  updatePartenaireExterneService,
} from '../API/services/index.ts';
import {
  PARTNER_DOCUMENTS_PERMISSION,
  PARTNER_PROSPECTS_PERMISSION,
  PARTNER_RECORDINGS_PERMISSION,
  PARTNER_STATISTICS_PERMISSION,
} from '../utils/scripts/index.ts';
import type { Campagne, PartenaireExterne, PartenaireExternePayload } from '../utils/types/index.ts';

const createInitialForm = (): PartenaireExternePayload => ({
  raison_sociale: '',
  nom: '',
  prenom: '',
  email: '',
  password: '',
  permissions: {
    [PARTNER_STATISTICS_PERMISSION]: true,
    [PARTNER_DOCUMENTS_PERMISSION]: false,
    [PARTNER_PROSPECTS_PERMISSION]: false,
    [PARTNER_RECORDINGS_PERMISSION]: false,
  },
  id_campagnes_autorisees: [],
  actif: true,
});

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function usePartenairesExternesPage() {
  const [partners, setPartners] = useState<PartenaireExterne[]>([]);
  const [campaigns, setCampaigns] = useState<Campagne[]>([]);
  const [form, setForm] = useState<PartenaireExternePayload>(createInitialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async (): Promise<void> => {
    const [loadedPartners, loadedCampaigns] = await Promise.all([
      getPartenairesExternesService(),
      getAllCampagnesService(),
    ]);
    setPartners(loadedPartners);
    setCampaigns(loadedCampaigns);
  }, []);

  useEffect(() => {
    void refresh().catch((loadError: unknown) => {
      setError(getErrorMessage(loadError, 'Erreur de chargement'));
    });
  }, [refresh]);

  const setField = useCallback((field: keyof PartenaireExternePayload, value: string | boolean): void => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const togglePermission = useCallback((permission: string, enabled: boolean): void => {
    setForm((current) => ({
      ...current,
      permissions: { ...current.permissions, [permission]: enabled },
    }));
  }, []);

  const selectCampaign = useCallback((id: number): void => {
    setForm((current) => ({
      ...current,
      id_campagnes_autorisees: [id],
    }));
  }, []);

  const edit = useCallback((partner: PartenaireExterne): void => {
    setEditingId(partner.id_partenaire_externe);
    setForm({
      ...partner,
      id_campagnes_autorisees: partner.id_campagnes_autorisees.length === 1
        ? partner.id_campagnes_autorisees
        : [],
      password: '',
    });
    setMessage(null);
    setError(null);
  }, []);

  const reset = useCallback((): void => {
    setEditingId(null);
    setForm(createInitialForm());
    setError(null);
    setMessage(null);
  }, []);

  const submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const wasEditing = editingId !== null;
    try {
      if (!editingId && !form.password) throw new Error('Le mot de passe est requis à la création.');
      if (form.id_campagnes_autorisees.length !== 1) {
        throw new Error('Sélectionnez l’unique campagne active de ce partenaire.');
      }
      if (editingId) await updatePartenaireExterneService(editingId, form);
      else await createPartenaireExterneService(form);
      await refresh();
      reset();
      setMessage(wasEditing ? 'Compte partenaire mis à jour.' : 'Compte partenaire créé.');
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Erreur lors de l’enregistrement'));
    } finally {
      setSaving(false);
    }
  }, [editingId, form, refresh, reset]);

  return {
    campaigns,
    edit,
    editingId,
    error,
    form,
    message,
    partners,
    reset,
    saving,
    setField,
    submit,
    selectCampaign,
    togglePermission,
  };
}

export type PartenairesExternesPageViewModel = ReturnType<typeof usePartenairesExternesPage>;
