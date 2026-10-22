import { useEffect, useState } from "react";
import {
  updateProspectService,
  confirmProspectWorkforce,
} from "../API/services/index.ts";
import { useAlert } from "../context/alert/index.ts";
import type {
  AddressSelectionResult,
  Prospect,
  ProspectUpdateData,
} from "../utils/types/index.ts";
import { capitalizeAddress } from "../utils/scripts/index.ts";

function buildProspectDraft(prospect: Prospect): ProspectUpdateData {
  return {
    effectif_min:
      prospect.effectif_min ??
      (typeof prospect.effectif === "number" ? prospect.effectif : null),
    effectif_max:
      prospect.effectif_max ??
      (typeof prospect.effectif === "number" ? prospect.effectif : null),
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
    site_web: prospect.site_web,
    qualite_site_web: prospect.qualite_site_web,
    type_site_web: prospect.type_site_web,
  };
}

function normalizeDraft(draft: ProspectUpdateData): ProspectUpdateData {
  return Object.fromEntries(
    Object.entries(draft).map(([key, value]) => [
      key,
      value === "" ? null : value,
    ]),
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

  const startEditing = (): void => {
    if (prospect) setIsEditing(true);
  };
  const cancelEditing = (): void => {
    setIsEditing(false);
    setEditedProspect({});
  };
  const changeField = (
    field: keyof ProspectUpdateData,
    value: string,
  ): void => {
    setEditedProspect((previous) => ({
      ...previous,
      [field]:
        field === "effectif_min" || field === "effectif_max"
          ? value === ""
            ? null
            : Number(value)
          : value,
    }));
  };
  const selectAddress = (result: AddressSelectionResult): void => {
    setEditedProspect((previous) => ({
      ...previous,
      adresse: result.adresse,
      code_postal: result.code_postal,
      ville: result.ville,
      pays: result.pays,
    }));
  };

  const save = async (): Promise<void> => {
    if (!prospect) return;
    const nom = editedProspect.nom ?? prospect.nom;
    if (!nom || nom.trim().length < 2) {
      await showError(
        "Le nom est obligatoire (2-100 caractères)",
        "Erreur de validation",
      );
      return;
    }
    const telephone = editedProspect.telephone ?? prospect.telephone;
    if (!telephone || telephone.trim().length < 6) {
      await showError("Le téléphone est obligatoire", "Erreur de validation");
      return;
    }

    if (
      editedProspect.effectif_min != null &&
      editedProspect.effectif_max != null &&
      editedProspect.effectif_min > editedProspect.effectif_max
    ) {
      await showError("Les bornes d’effectif sont incohérentes.");
      return;
    }
    const workforceChanged =
      editedProspect.effectif_min !==
        (prospect.effectif_min ??
          (typeof prospect.effectif === "number" ? prospect.effectif : null)) ||
      editedProspect.effectif_max !==
        (prospect.effectif_max ??
          (typeof prospect.effectif === "number" ? prospect.effectif : null));
    const { effectif_min, effectif_max, ...otherFields } = editedProspect;
    setIsSubmitting(true);
    try {
      const updated = await updateProspectService(
        prospect.id_prospect,
        normalizeDraft({
          ...otherFields,
          ...(workforceChanged
            ? {
                effectif_min,
                effectif_max,
                effectif:
                  effectif_min !== null && effectif_min === effectif_max
                    ? effectif_min
                    : null,
                effectif_libelle: null,
              }
            : {}),
          adresse: capitalizeAddress(editedProspect.adresse ?? ""),
          ville: capitalizeAddress(editedProspect.ville ?? ""),
          pays: capitalizeAddress(editedProspect.pays ?? ""),
        }),
      );
      onProspectUpdated?.(updated);
      setIsEditing(false);
      await showSuccess("Prospect mis à jour avec succès", "Succès");
    } catch (requestError) {
      await showError(
        requestError instanceof Error
          ? requestError.message
          : "Erreur lors de la mise à jour du prospect",
        "Erreur",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmWorkforce = async (): Promise<void> => {
    if (!prospect || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const confirmed = await confirmProspectWorkforce(prospect.id_prospect);
      onProspectUpdated?.(confirmed);
      await showSuccess("Effectif confirmé.");
    } catch (error: unknown) {
      await showError(
        error instanceof Error ? error.message : "Confirmation impossible.",
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
    selectAddress,
    workforceMin: isEditing
      ? (editedProspect.effectif_min ?? "")
      : (prospect?.effectif_min ?? prospect?.effectif ?? ""),
    workforceMax: isEditing
      ? (editedProspect.effectif_max ?? "")
      : (prospect?.effectif_max ?? prospect?.effectif ?? ""),
    save,
    confirmWorkforce,
  };
}
