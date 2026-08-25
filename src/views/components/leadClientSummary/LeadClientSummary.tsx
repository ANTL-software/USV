import { useState, type FormEvent, type ReactElement } from 'react';
import { IoBusiness, IoCheckmark, IoClose, IoInformationCircle, IoPencil, IoPerson } from 'react-icons/io5';
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

interface LeadClientSummaryProps {
  lead: LeadClient;
  notesUpdateLoading: boolean;
  onUpdateNotes: (notes: string) => Promise<boolean>;
}

export function LeadClientSummary({ lead, notesUpdateLoading, onUpdateNotes }: LeadClientSummaryProps): ReactElement {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(lead.notes ?? '');

  const submitNotes = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const hasUpdated = await onUpdateNotes(notesDraft);
    if (hasUpdated) {
      setIsEditingNotes(false);
    }
  };

  const cancelNotesEdition = (): void => {
    setNotesDraft(lead.notes ?? '');
    setIsEditingNotes(false);
  };

  const startNotesEdition = (): void => {
    setNotesDraft(lead.notes ?? '');
    setIsEditingNotes(true);
  };

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
          <div className="grid-item"><span className="grid-label">Entreprise + de 5 salariés</span><span className="grid-value">{lead.entreprise_plus_de_cinq_salaries ? 'Oui' : 'Non'}</span></div>
          <div className="grid-item full-width"><span className="grid-label">Motif</span><span className="grid-value">{lead.motif ?? '—'}</span></div>
          <div className="grid-item full-width">
            <div className="leadClientDetails__notes-label"><span className="grid-label">Notes du rendez-vous</span><button type="button" className="leadClientDetails__notes-edit" onClick={startNotesEdition} title="Modifier les notes" aria-label="Modifier les notes du rendez-vous"><IoPencil /></button></div>
            {isEditingNotes ? (
              <form className="leadClientDetails__notes-form" onSubmit={(event) => { void submitNotes(event); }}>
                <textarea value={notesDraft} onChange={(event) => setNotesDraft(event.target.value)} maxLength={10000} autoFocus disabled={notesUpdateLoading} aria-label="Notes du rendez-vous" />
                <div className="leadClientDetails__notes-actions"><button type="button" onClick={cancelNotesEdition} disabled={notesUpdateLoading}><IoClose /> Annuler</button><button type="submit" disabled={notesUpdateLoading}><IoCheckmark /> {notesUpdateLoading ? 'Enregistrement…' : 'Enregistrer'}</button></div>
              </form>
            ) : (
              <p className="notes-text">{lead.notes || 'Aucune note renseignée.'}</p>
            )}
          </div>
          {lead.derniere_note_closing && <div className="grid-item full-width"><span className="grid-label">Dernière note de closing (campagne)</span><p className="notes-text">{lead.derniere_note_closing}</p></div>}
        </div>
      </section>
    </>
  );
}
