import { useEffect, useState } from 'react';
import { updateProspectService } from '../API/services/index.ts';
import { useAlert } from '../context/alert/index.ts';
import type { Prospect, ProspectUpdateData } from '../utils/types/index.ts';

function buildProspectDraft(prospect: Prospect): ProspectUpdateData {
  return {
    type_prospect: prospect.type_prospect,
    nom: prospect.nom,
    prenom: prospect.prenom,
    raison_sociale: prospect.raison_sociale,
    email: prospect.email,
    telephone: prospect.telephone,
    adresse: prospect.adresse,
    code_postal: prospect.code_postal,
    ville: prospect.ville,
    pays: prospect.pays,
    statut: prospect.statut,
    notes: undefined,
    siret: prospect.siret,
    code_naf: prospect.code_naf,
    activite: prospect.activite,
    secteur: prospect.secteur,
    region: prospect.region,
    civilite: prospect.civilite,
    telephone_contact: prospect.telephone_contact,
  };
}

function normalizeDraft(draft: ProspectUpdateData): ProspectUpdateData {
  return Object.fromEntries(
    Object.entries(draft).map(([key, value]) => [key, value === '' ? null : value]),
  ) as ProspectUpdateData;
}

export function useProspectEditor(
  prospect: Prospect | null,
  onProspectUpdated?: (updatedProspect: Prospect) => void,
) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedProspect, setEditedProspect] = useState<ProspectUpdateData>({});
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    if (isEditing && prospect) {
      queueMicrotask(() => setEditedProspect(buildProspectDraft(prospect)));
    }
  }, [isEditing, prospect]);

  const startEditing = (): void => { if (prospect) setIsEditing(true); };
  const cancelEditing = (): void => {
    setIsEditing(false);
    setEditedProspect({});
  };
  const changeField = (field: keyof ProspectUpdateData, value: string): void => {
    setEditedProspect((previous) => ({ ...previous, [field]: value }));
  };

  const save = async (): Promise<void> => {
    if (!prospect) return;
    const nom = editedProspect.nom ?? prospect.nom;
    if (!nom || nom.trim().length < 2) {
      await showError('Le nom est obligatoire (2-100 caractères)', 'Erreur de validation');
      return;
    }
    const telephone = editedProspect.telephone ?? prospect.telephone;
    if (!telephone || telephone.trim().length < 6) {
      await showError('Le téléphone est obligatoire', 'Erreur de validation');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateProspectService(prospect.id_prospect, normalizeDraft(editedProspect));
      await showSuccess('Prospect mis à jour avec succès', 'Succès');
      onProspectUpdated?.(updated);
      setIsEditing(false);
    } catch (requestError) {
      await showError(
        requestError instanceof Error ? requestError.message : 'Erreur lors de la mise à jour du prospect',
        'Erreur',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isEditing,
    isSubmitting,
    editedProspect,
    startEditing,
    cancelEditing,
    changeField,
    save,
  };
}
