import type { LeadClient, LeadClientStats, Vente } from '../types/index.ts';

export type CommandesPeriodPreset = 'current_month' | 'previous_month' | 'custom';
export type CommandesViewMode = 'actives' | 'corbeille';

export const COMMANDES_VIEW_OPTIONS = [
  { value: 'actives', label: 'Commandes actives' },
  { value: 'corbeille', label: '🗑️ Corbeille (supprimées)' },
] as const;

export const COMMANDES_PERIOD_OPTIONS: Array<{ value: CommandesPeriodPreset; label: string }> = [
  { value: 'current_month', label: 'Mois en cours' },
  { value: 'previous_month', label: 'Mois précédent' },
  { value: 'custom', label: 'Période personnalisée' },
];

export interface CommandesSummaryCard {
  label: string;
  value: string;
  meta?: string;
  tone: 'total' | 'amount' | 'validee' | 'attente' | 'annulee' | 'frigo';
}

export interface DateBounds {
  start: string;
  end: string;
}

export function formatMontant(montant: string): string {
  const value = Number.parseFloat(montant);

  if (Number.isNaN(value)) {
    return '0,00 €';
  }

  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

export function formatDate(dateValue: string): string {
  return new Date(dateValue).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatLeadSlot(dateValue: string, timeValue: string): string {
  const date = new Date(`${dateValue}T${timeValue}`);

  if (Number.isNaN(date.getTime())) {
    return `${dateValue} ${timeValue}`;
  }

  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getMonthBounds(monthOffset: number): DateBounds {
  const referenceDate = new Date();
  const firstDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + monthOffset, 1);
  const lastDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + monthOffset + 1, 0);

  return {
    start: toInputDate(firstDay),
    end: toInputDate(lastDay),
  };
}

export function getVenteProspectName(vente: Vente): string {
  if (!vente.prospect) {
    return '—';
  }

  const raisonSociale = vente.prospect.raison_sociale?.trim();
  if (raisonSociale) {
    return raisonSociale;
  }

  const parts = [vente.prospect.nom.toUpperCase()];
  if (vente.prospect.prenom) {
    parts.push(vente.prospect.prenom);
  }

  return parts.join(' ');
}

export function getLeadProspectName(lead: LeadClient): string {
  const raisonSociale = lead.prospect?.raison_sociale?.trim();
  if (raisonSociale) {
    return raisonSociale;
  }

  const contactName = lead.interlocuteur_nom?.trim()
    || lead.prospect?.decisionnaire_nom?.trim()
    || lead.prospect?.nom_contact?.trim();

  if (contactName) {
    return contactName;
  }

  const parts = [lead.prospect?.nom?.toUpperCase(), lead.prospect?.prenom]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

  return parts.join(' ') || '—';
}

export function getVenteAgentName(vente: Vente): string {
  if (!vente.agent) {
    return '—';
  }

  return `${vente.agent.prenom} ${vente.agent.nom.toUpperCase()}`;
}

export function getLeadAgentName(lead: LeadClient): string {
  if (!lead.agent) {
    return '—';
  }

  return `${lead.agent.prenom} ${lead.agent.nom.toUpperCase()}`;
}

export function getLeadInterlocuteur(lead: LeadClient): string {
  return lead.interlocuteur_nom
    ?? lead.prospect?.decisionnaire_nom
    ?? lead.prospect?.nom_contact
    ?? '—';
}

export function buildLeadCommandesSummary(stats: LeadClientStats): CommandesSummaryCard[] {
  return [
    { label: 'Rendez-vous pris', value: String(stats.total), tone: 'total' },
    { label: 'Planifiés', value: String(stats.planifies), tone: 'validee' },
    { label: 'Effectués', value: String(stats.effectues), tone: 'amount' },
    { label: 'Annulés', value: String(stats.annules), tone: 'annulee' },
    { label: 'Reportés', value: String(stats.reportes), tone: 'attente' },
    { label: 'Non honorés', value: String(stats.nonHonores), tone: 'frigo' },
  ];
}

export function buildSaleCommandesSummary(values: {
  totalCount: number;
  averageValidatedAmount: number;
  validatedAmount: number;
  validatedCount: number;
  pendingAmount: number;
  pendingCount: number;
  cancelledAmount: number;
  cancelledCount: number;
  suspendedAmount: number;
  suspendedCount: number;
}): CommandesSummaryCard[] {
  return [
    { label: 'Nbre de CDE', value: String(values.totalCount), tone: 'total' },
    { label: 'Moyenne', value: formatMontant(String(values.averageValidatedAmount)), tone: 'amount' },
    { label: 'Validées', value: formatMontant(String(values.validatedAmount)), meta: `(${values.validatedCount})`, tone: 'validee' },
    { label: 'En attente', value: formatMontant(String(values.pendingAmount)), meta: `(${values.pendingCount})`, tone: 'attente' },
    { label: 'Annulées', value: formatMontant(String(values.cancelledAmount)), meta: `(${values.cancelledCount})`, tone: 'annulee' },
    { label: 'CDE suspendues', value: formatMontant(String(values.suspendedAmount)), meta: `(${values.suspendedCount})`, tone: 'frigo' },
  ];
}

function toInputDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
