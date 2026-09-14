import type { ReactElement } from 'react';
import type { CommercialAgendaViewModel } from '../../../hooks/index.ts';
import { COMMERCIAL_AGENDA_STATUS_OPTIONS } from '../../../utils/scripts/index.ts';
import type { CommercialAgendaEditForm } from '../../../utils/types/index.ts';
import { Button, Modal } from '../index.ts';

interface CommercialAgendaEditModalProps {
  viewModel: CommercialAgendaViewModel['edit'];
}

export function CommercialAgendaEditModal({ viewModel }: CommercialAgendaEditModalProps): ReactElement | null {
  const { form, rendezVous } = viewModel;
  if (!form || !rendezVous) return null;

  return <Modal isVisible onClose={viewModel.close} title="Déplacer ou modifier le rendez-vous">
    <form className="commercialAgenda__editForm" onSubmit={(event) => { event.preventDefault(); void viewModel.submit(); }}>
      <p>Le rendez-vous reste attribué au commercial sélectionné.</p>
      <div className="commercialAgenda__editRow">
        <label><span>Date</span><input type="date" min={viewModel.today} value={form.date} onChange={(event) => viewModel.updateField('date', event.target.value)} required /></label>
        <label><span>Heure</span><input type="time" value={form.time} onChange={(event) => viewModel.updateField('time', event.target.value)} required /></label>
      </div>
      <label className="commercialAgenda__editField"><span>Statut</span><select value={form.statut} onChange={(event) => viewModel.updateField('statut', event.target.value as CommercialAgendaEditForm['statut'])}>{COMMERCIAL_AGENDA_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      {form.error && <p className="commercialAgenda__error" role="alert">{form.error}</p>}
      <div className="commercialAgenda__modalActions">
        <Button style="grey" onClick={viewModel.close} disabled={viewModel.isSubmitting}>Fermer</Button>
        <Button style="gradient" type="submit" disabled={viewModel.isSubmitting}>{viewModel.isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</Button>
      </div>
    </form>
  </Modal>;
}
