import type { ReactElement } from 'react';
import { IoBusiness, IoInformationCircle, IoPerson } from 'react-icons/io5';
import type { LeadClient } from '../../../utils/types/index.ts';
import {
  formatLeadAgentLabel,
  formatLeadDateTime,
  formatLeadProspectAddress,
  formatLeadProspectLabel,
  resolveLeadContactEmail,
  resolveLeadContactName,
  resolveLeadContactPhone,
  resolveLeadContactRole,
} from '../../../utils/scripts/index.ts';

interface LeadClientSummaryProps { lead: LeadClient }

export function LeadClientSummary({ lead }: LeadClientSummaryProps): ReactElement {
  return (
    <>
      <section className="details-section card-style">
        <h3 className="section-title"><IoBusiness /> Client & contact</h3>
        <div className="details-grid">
          <div className="grid-item full-width"><span className="grid-label">Client</span><span className="grid-value grid-value--bold">{formatLeadProspectLabel(lead)}</span></div>
          <div className="grid-item"><span className="grid-label">Interlocuteur</span><span className="grid-value leadClientDetails__contact"><IoPerson />{resolveLeadContactName(lead)}</span></div>
          <div className="grid-item"><span className="grid-label">Fonction</span><span className="grid-value">{resolveLeadContactRole(lead)}</span></div>
          <div className="grid-item"><span className="grid-label">Téléphone</span><span className="grid-value">{resolveLeadContactPhone(lead)}</span></div>
          <div className="grid-item"><span className="grid-label">Email</span><span className="grid-value">{resolveLeadContactEmail(lead)}</span></div>
          <div className="grid-item full-width"><span className="grid-label">Adresse</span><span className="grid-value">{formatLeadProspectAddress(lead)}</span></div>
        </div>
      </section>
      <section className="details-section card-style">
        <h3 className="section-title"><IoInformationCircle /> Informations du rendez-vous</h3>
        <div className="details-grid">
          <div className="grid-item"><span className="grid-label">Date de prise</span><span className="grid-value">{formatLeadDateTime(lead.created_at)}</span></div>
          <div className="grid-item"><span className="grid-label">Rendez-vous client</span><span className="grid-value">{formatLeadDateTime(lead.date_rdv, lead.heure_rdv)}</span></div>
          <div className="grid-item"><span className="grid-label">Commercial</span><span className="grid-value">{formatLeadAgentLabel(lead)}</span></div>
          <div className="grid-item"><span className="grid-label">Campagne</span><span className="grid-value">{lead.campagne?.nom_campagne ?? '—'}</span></div>
          <div className="grid-item full-width"><span className="grid-label">Motif</span><span className="grid-value">{lead.motif ?? '—'}</span></div>
          {lead.notes && <div className="grid-item full-width"><span className="grid-label">Notes du rendez-vous</span><p className="notes-text">{lead.notes}</p></div>}
          {lead.derniere_note_closing && <div className="grid-item full-width"><span className="grid-label">Dernière note de closing (campagne)</span><p className="notes-text">{lead.derniere_note_closing}</p></div>}
        </div>
      </section>
    </>
  );
}
