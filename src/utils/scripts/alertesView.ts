import { ALERTE_TYPES } from '../types/index.ts';
import type { AlerteConfig, AlerteDestinataire, AlerteHistory, AlerteTypeMetadata, UpdateAlerteConfigPayload } from '../types/index.ts';

export function getAlerteTypeMetadata(alerte: AlerteConfig): AlerteTypeMetadata | undefined {
  return ALERTE_TYPES.find(({ value }) => value === alerte.type_alerte);
}

export function getAlerteThreshold(alerte: AlerteConfig): number | '' {
  return alerte.seuil ?? alerte.seuil_duree ?? alerte.seuil_minutes ?? '';
}

export function updateAlerteThreshold(alerte: AlerteConfig, value: number): AlerteConfig {
  const key = alerte.type_alerte === 'taux_echec' ? 'seuil' : alerte.type_alerte === 'duree_courte' ? 'seuil_duree' : 'seuil_minutes';
  return { ...alerte, [key]: value };
}

export function addAlerteRecipient(alerte: AlerteConfig): AlerteConfig {
  return { ...alerte, destinataires: [...alerte.destinataires, { type: 'email', value: '' }] };
}

export function removeAlerteRecipient(alerte: AlerteConfig, index: number): AlerteConfig {
  return { ...alerte, destinataires: alerte.destinataires.filter((_, recipientIndex) => recipientIndex !== index) };
}

export function updateAlerteRecipient(alerte: AlerteConfig, index: number, recipient: AlerteDestinataire): AlerteConfig {
  return { ...alerte, destinataires: alerte.destinataires.map((current, recipientIndex) => recipientIndex === index ? recipient : current) };
}

export function toAlerteUpdatePayload(alerte: AlerteConfig): UpdateAlerteConfigPayload {
  return { actif: alerte.actif, destinataires: alerte.destinataires, seuil: alerte.seuil, seuil_duree: alerte.seuil_duree, seuil_minutes: alerte.seuil_minutes };
}

export function formatAlerteHistoryDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('fr-FR');
}

export function formatAlerteHistoryValue(alerte: AlerteHistory): string {
  return alerte.derniere_valeur === null ? 'N/A' : alerte.derniere_valeur.toFixed(1);
}
