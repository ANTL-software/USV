import type { Appel, LeadClient, StatutRendezVous } from '../types/index.ts';

export const LEAD_QUALIFICATION_OPTIONS: StatutRendezVous[] = [
  'effectue',
  'planifie',
  'reporte',
  'annule',
  'non_honore',
];

export function formatLeadDateTime(dateValue?: string | null, timeValue?: string | null): string {
  if (!dateValue) {
    return '—';
  }

  const parsedDate = new Date(timeValue ? `${dateValue}T${timeValue}` : dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return timeValue ? `${dateValue} ${timeValue}` : dateValue;
  }

  return parsedDate.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: timeValue ? '2-digit' : undefined,
    minute: timeValue ? '2-digit' : undefined,
  });
}

export function formatLeadProspectLabel(lead: LeadClient): string {
  if (!lead.prospect) {
    return '—';
  }

  const raisonSociale = lead.prospect.raison_sociale?.trim();
  if (raisonSociale) {
    return raisonSociale;
  }

  const fullName = [lead.prospect.nom?.toUpperCase(), lead.prospect.prenom]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ');
  return fullName || `Prospect #${lead.prospect.id_prospect}`;
}

export function formatLeadAgentLabel(lead: LeadClient): string {
  return lead.agent ? `${lead.agent.prenom} ${lead.agent.nom.toUpperCase()}` : '—';
}

export function resolveLeadContactName(lead: LeadClient): string {
  return lead.interlocuteur_nom
    ?? lead.prospect?.decisionnaire_nom
    ?? lead.prospect?.nom_contact
    ?? '—';
}

export function resolveLeadContactRole(lead: LeadClient): string {
  return lead.interlocuteur_role ?? lead.prospect?.decisionnaire_fonction ?? '—';
}

export function resolveLeadContactPhone(lead: LeadClient): string {
  return lead.telephone_contact_snapshot
    ?? lead.prospect?.telephone_contact
    ?? lead.prospect?.telephone
    ?? '—';
}

export function resolveLeadContactEmail(lead: LeadClient): string {
  return lead.email_contact_snapshot
    ?? lead.prospect?.decisionnaire_email_pro
    ?? lead.prospect?.email
    ?? '—';
}

export function formatLeadProspectAddress(lead: LeadClient): string {
  const locality = [lead.prospect?.code_postal?.trim(), lead.prospect?.ville?.trim()]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');

  return [lead.prospect?.adresse_facturation?.trim(), locality, lead.prospect?.pays?.trim()]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(', ') || '—';
}

export function resolveCallAgent(appel: Appel): string {
  const agent = appel.agent ?? appel.Employe;
  return agent ? `${agent.prenom} ${agent.nom.toUpperCase()}` : '—';
}

export function getLeadQualificationButtonClass(statut: StatutRendezVous): string {
  const classes: Record<StatutRendezVous, string> = {
    planifie: 'qualif-btn--planifie',
    effectue: 'qualif-btn--effectue',
    annule: 'qualif-btn--annule',
    reporte: 'qualif-btn--reporte',
    non_honore: 'qualif-btn--non-honore',
  };
  return classes[statut];
}

export const getLeadStatusBadgeClass = (statut: StatutRendezVous): string => `statut-badge statut-badge--${statut}`;
