import './bookingMoveModal.scss';
import type { ReactElement } from 'react';
import Select from 'react-select';
import type { BookingMoveViewModel } from '../../../hooks/index.ts';
import { bookingSelectStyles } from '../../../utils/styles/index.ts';

interface BookingMoveModalProps { viewModel: BookingMoveViewModel; }

export default function BookingMoveModal({ viewModel }: Readonly<BookingMoveModalProps>): ReactElement | null {
  const state = viewModel.state;
  if (!state) return null;
  return <div id="bookingMoveOverlay" onClick={viewModel.close}>
    <div id="bookingMoveModal" onClick={(event) => event.stopPropagation()}>
      <div className="modalHeader"><h2>Déplacer le rendez-vous</h2><button type="button" className="closeBtn" onClick={viewModel.close} aria-label="Fermer">✕</button></div>
      <div className="modalBody">
        <div className="beneficiaireInfo"><span className="infoLabel">Pour :</span><span className="infoValue">{viewModel.beneficiaryLabel}</span></div>
        <div className="fieldGroup"><label htmlFor="moveDate">Nouvelle date *</label><input id="moveDate" type="date" value={state.date} min={viewModel.today} onChange={(event) => viewModel.updateField('date', event.target.value)} disabled={viewModel.isSubmitting} /></div>
        <div className="fieldGroup fieldGroup--heure">
          <label>Nouvelle heure *</label>
          <div className="heureSelects">
            <Select options={viewModel.hourOptions} value={state.heure} onChange={(option) => viewModel.updateField('heure', option)} styles={bookingSelectStyles} placeholder="Heure" isSearchable={false} isClearable={false} isDisabled={viewModel.isSubmitting} menuPortalTarget={viewModel.portalTarget} menuPosition="fixed" />
            <span className="heureSeparator">:</span>
            <Select options={viewModel.minuteOptions} value={state.minute} onChange={(option) => viewModel.updateField('minute', option)} styles={bookingSelectStyles} placeholder="00" isSearchable={false} isClearable={false} isDisabled={viewModel.isSubmitting} menuPortalTarget={viewModel.portalTarget} menuPosition="fixed" />
          </div><small>Plage : 07h00 à 18h45</small>
        </div>
        <div className="fieldGroup"><label htmlFor="moveDateFin">Date de fin *</label><input id="moveDateFin" type="date" value={state.dateFin} min={viewModel.today} onChange={(event) => viewModel.updateField('dateFin', event.target.value)} disabled={viewModel.isSubmitting} /><small>Par défaut : même jour que le début</small></div>
        <div className="fieldGroup fieldGroup--heure">
          <label>Heure de fin *</label>
          <div className="heureSelects">
            <Select options={viewModel.hourOptions} value={state.heureFin} onChange={(option) => viewModel.updateField('heureFin', option)} styles={bookingSelectStyles} placeholder="Heure" isSearchable={false} isClearable={false} isDisabled={viewModel.isSubmitting} menuPortalTarget={viewModel.portalTarget} menuPosition="fixed" />
            <span className="heureSeparator">:</span>
            <Select options={viewModel.minuteOptions} value={state.minuteFin} onChange={(option) => viewModel.updateField('minuteFin', option)} styles={bookingSelectStyles} placeholder="00" isSearchable={false} isClearable={false} isDisabled={viewModel.isSubmitting} menuPortalTarget={viewModel.portalTarget} menuPosition="fixed" />
          </div><small>Par défaut : +1 heure après le début</small>
        </div>
        {state.error && <p className="formError">{state.error}</p>}
      </div>
      <div className="modalFooter"><button type="button" className="btnCancel" onClick={viewModel.close} disabled={viewModel.isSubmitting}>Annuler</button><button type="button" className="btnSubmit" onClick={() => void viewModel.submit()} disabled={viewModel.isSubmitting}>{viewModel.isSubmitting ? 'Déplacement...' : 'Confirmer le déplacement'}</button></div>
    </div>
  </div>;
}
