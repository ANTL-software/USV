import './bookingForm.scss';
import type { ReactElement } from 'react';
import Select from 'react-select';
import type { BookingFormViewModel } from '../../../hooks/index.ts';
import { bookingSelectStyles } from '../../../utils/styles/index.ts';

interface BookingFormProps { viewModel: BookingFormViewModel; }

export default function BookingForm({ viewModel }: Readonly<BookingFormProps>): ReactElement {
  const { state } = viewModel;
  return <div id="bookingFormOverlay" onClick={viewModel.close}>
    <div id="bookingForm" onClick={(event) => event.stopPropagation()}>
      <div className="formHeader"><h2>Nouveau rendez-vous</h2><button type="button" className="closeBtn" onClick={viewModel.close} aria-label="Fermer">✕</button></div>
      <div className="formBody">
        <div className="fieldGroup">
          <label>Employé ANTL *</label>
          <Select options={viewModel.employees} value={state.employe} onChange={(option) => viewModel.updateField('employe', option)} styles={bookingSelectStyles} placeholder="Sélectionner un employé..." isSearchable isClearable isLoading={viewModel.loadingEmployees} isDisabled={viewModel.isSubmitting} noOptionsMessage={() => 'Aucun employé trouvé'} loadingMessage={() => 'Chargement...'} menuPortalTarget={viewModel.portalTarget} menuPosition="fixed" />
        </div>
        <div className="fieldGroup"><label htmlFor="bookingDate">Date *</label><input id="bookingDate" type="date" value={state.date} min={viewModel.today} onChange={(event) => viewModel.updateField('date', event.target.value)} disabled={viewModel.isSubmitting} /></div>
        <div className="fieldGroup fieldGroup--heure">
          <label>Heure de début *</label>
          <div className="heureSelects">
            <Select options={viewModel.hourOptions} value={state.heure} onChange={(option) => viewModel.updateField('heure', option)} styles={bookingSelectStyles} placeholder="Heure" isSearchable={false} isClearable={false} isDisabled={viewModel.isSubmitting} menuPortalTarget={viewModel.portalTarget} menuPosition="fixed" />
            <span className="heureSeparator">:</span>
            <Select options={viewModel.minuteOptions} value={state.minute} onChange={(option) => viewModel.updateField('minute', option)} styles={bookingSelectStyles} placeholder="00" isSearchable={false} isClearable={false} isDisabled={viewModel.isSubmitting} menuPortalTarget={viewModel.portalTarget} menuPosition="fixed" />
          </div><small>Plage : 07h00 à 18h45</small>
        </div>
        <div className="fieldGroup"><label htmlFor="bookingDateFin">Date de fin *</label><input id="bookingDateFin" type="date" value={state.dateFin} min={viewModel.today} onChange={(event) => viewModel.updateField('dateFin', event.target.value)} disabled={viewModel.isSubmitting} /><small>Par défaut : même jour que le début</small></div>
        <div className="fieldGroup fieldGroup--heure">
          <label>Heure de fin *</label>
          <div className="heureSelects">
            <Select options={viewModel.hourOptions} value={state.heureFin} onChange={(option) => viewModel.updateField('heureFin', option)} styles={bookingSelectStyles} placeholder="Heure" isSearchable={false} isClearable={false} isDisabled={viewModel.isSubmitting} menuPortalTarget={viewModel.portalTarget} menuPosition="fixed" />
            <span className="heureSeparator">:</span>
            <Select options={viewModel.minuteOptions} value={state.minuteFin} onChange={(option) => viewModel.updateField('minuteFin', option)} styles={bookingSelectStyles} placeholder="00" isSearchable={false} isClearable={false} isDisabled={viewModel.isSubmitting} menuPortalTarget={viewModel.portalTarget} menuPosition="fixed" />
          </div><small>Par défaut : +1 heure après le début</small>
        </div>
        <div className="fieldGroup"><label htmlFor="personneExterne">Personne externe</label><input id="personneExterne" type="text" value={state.personneExterne} onChange={(event) => viewModel.updateField('personneExterne', event.target.value)} placeholder="Nom du client/prestataire..." disabled={viewModel.isSubmitting} /></div>
        <div className="fieldGroup"><label htmlFor="description">Description</label><textarea id="description" value={state.description} onChange={(event) => viewModel.updateField('description', event.target.value)} placeholder="Détails sur le RDV..." rows={3} disabled={viewModel.isSubmitting} /></div>
        {state.error && <p className="formError">{state.error}</p>}
      </div>
      <div className="formFooter"><button type="button" className="btnCancel" onClick={viewModel.close} disabled={viewModel.isSubmitting}>Annuler</button><button type="button" className="btnSubmit" onClick={() => void viewModel.submit()} disabled={viewModel.isSubmitting}>{viewModel.isSubmitting ? 'Création...' : 'Créer'}</button></div>
    </div>
  </div>;
}
