import {
  ETAT_MATERIEL_LABELS,
  TYPE_MATERIEL_LABELS,
} from '../types/index.ts';
import type {
  CreateMaterielPayload,
  Employe,
  EtatMateriel,
  Materiel,
  MaterielAffectation,
  TypeMateriel,
  UpdateMaterielPayload,
} from '../types/index.ts';
import { formatDate } from './formatters.ts';

export type MaterielModalMode = 'create' | 'edit';

export interface MaterielFormState {
  nom_machine: string;
  marque: string;
  type_materiel: TypeMateriel;
  adresse_mac: string;
  numero_serie: string;
  rustdesk_id: string;
  rustdesk_password: string;
  notes: string;
}

export interface MaterielEmployeOption {
  value: number;
  label: string;
}

export interface MaterielTableRow {
  id: number;
  name: string;
  brand: string;
  typeLabel: string;
  typeClassName: string;
  serialNumber: string;
  macAddress: string;
  rustdeskId: string;
  employeeName: string | null;
  assignedSince: string;
  notes: string;
  isActive: boolean;
  isAssigned: boolean;
  source: Materiel;
}

export interface MaterielHistoryRow {
  id: number;
  employeeName: string;
  startDate: string;
  endDate: string | null;
  initialStateLabel: string | null;
  initialState: EtatMateriel | null;
  returnStateLabel: string | null;
  returnState: EtatMateriel | null;
  notes: string;
  isCurrent: boolean;
}

export const EMPTY_MATERIEL_FORM: MaterielFormState = {
  nom_machine: '',
  marque: '',
  type_materiel: 'laptop',
  adresse_mac: '',
  numero_serie: '',
  rustdesk_id: '',
  rustdesk_password: '',
  notes: '',
};

export function buildMaterielForm(materiel: Materiel): MaterielFormState {
  return {
    nom_machine: materiel.nom_machine,
    marque: materiel.marque ?? '',
    type_materiel: materiel.type_materiel,
    adresse_mac: materiel.adresse_mac ?? '',
    numero_serie: materiel.numero_serie ?? '',
    rustdesk_id: materiel.rustdesk_id ?? '',
    rustdesk_password: materiel.rustdesk_password ?? '',
    notes: materiel.notes ?? '',
  };
}

export function buildMaterielPayload(
  form: MaterielFormState,
): CreateMaterielPayload & UpdateMaterielPayload {
  return {
    nom_machine: form.nom_machine.trim(),
    marque: form.marque.trim() || undefined,
    type_materiel: form.type_materiel,
    adresse_mac: form.adresse_mac.trim() || undefined,
    numero_serie: form.numero_serie.trim() || undefined,
    rustdesk_id: form.rustdesk_id.trim() || undefined,
    rustdesk_password: form.rustdesk_password.trim() || undefined,
    notes: form.notes.trim() || undefined,
  };
}

export function getActiveMaterielAffectation(materiel: Materiel): MaterielAffectation | null {
  return materiel.affectations?.find(({ date_restitution }) => date_restitution === null) ?? null;
}

export function buildMaterielTableRows(materiels: Materiel[]): MaterielTableRow[] {
  return materiels.map((materiel) => {
    const affectation = getActiveMaterielAffectation(materiel);
    const employee = affectation?.employe;
    return {
      id: materiel.id_materiel,
      name: materiel.nom_machine,
      brand: materiel.marque ?? '—',
      typeLabel: TYPE_MATERIEL_LABELS[materiel.type_materiel],
      typeClassName: `materielList__badge--${materiel.type_materiel}`,
      serialNumber: materiel.numero_serie || '—',
      macAddress: materiel.adresse_mac || '—',
      rustdeskId: materiel.rustdesk_id || '—',
      employeeName: employee ? `${employee.prenom} ${employee.nom.toUpperCase()}` : null,
      assignedSince: affectation?.date_affectation ? formatDate(affectation.date_affectation) : '—',
      notes: materiel.notes || '—',
      isActive: materiel.actif,
      isAssigned: affectation !== null,
      source: materiel,
    };
  });
}

export function buildMaterielHistoryRows(
  historique: MaterielAffectation[],
): MaterielHistoryRow[] {
  return historique.map((affectation) => ({
    id: affectation.id_affectation,
    employeeName: affectation.employe
      ? `${affectation.employe.prenom} ${affectation.employe.nom.toUpperCase()}`
      : `#${affectation.id_employe}`,
    startDate: formatDate(affectation.date_affectation),
    endDate: affectation.date_restitution ? formatDate(affectation.date_restitution) : null,
    initialStateLabel: affectation.etat_affectation ? ETAT_MATERIEL_LABELS[affectation.etat_affectation] : null,
    initialState: affectation.etat_affectation,
    returnStateLabel: affectation.etat_restitution ? ETAT_MATERIEL_LABELS[affectation.etat_restitution] : null,
    returnState: affectation.etat_restitution,
    notes: affectation.notes || '—',
    isCurrent: !affectation.date_restitution,
  }));
}

export function buildMaterielEmployeOptions(employes: Employe[]): MaterielEmployeOption[] {
  return employes
    .filter(({ actif }) => actif)
    .map((employe) => ({
      value: employe.id_employe,
      label: `${employe.prenom} ${employe.nom.toUpperCase()} (${employe.identifiant})`,
    }));
}

export function getMaterielCountLabel(count: number): string {
  return `${count} machine${count !== 1 ? 's' : ''} enregistrée${count !== 1 ? 's' : ''}`;
}
