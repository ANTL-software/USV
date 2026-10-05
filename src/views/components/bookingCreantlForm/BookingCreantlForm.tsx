import Select from 'react-select';
import type { BookingCreantlLeadViewModel } from '../../../hooks/index.ts';
import { bookingSelectStyles } from '../../../utils/styles/index.ts';
import { AddressAutocomplete } from '../addressAutocomplete/index.ts';
export function BookingCreantlForm({ viewModel: vm }: Readonly<{ viewModel: BookingCreantlLeadViewModel }>) {
  const { draft, update } = vm;
  return <div className="bookingCreantlForm">
    <p>Ce formulaire crée un lead Créantl dans les commandes et son rendez-vous dans l’agenda.</p>
    <p>Le rendez-vous sera attribué à Théo, ou à Nelly le vendredi dès 14h00. Durée : 1 heure.</p>
    <div className="fieldGroup"><label htmlFor="creantlProspect">Rechercher un prospect existant</label>
      <Select inputId="creantlProspect" options={vm.prospects} value={vm.selectedProspect} onChange={vm.selectProspect} onInputChange={vm.setSearch} isLoading={vm.loadingProspects} isDisabled={vm.isSubmitting} isClearable placeholder="Entreprise, téléphone ou contact (3 caractères)…" noOptionsMessage={() => 'Aucun résultat : renseignez une nouvelle entreprise ci-dessous.'} styles={bookingSelectStyles} menuPortalTarget={document.body} menuPosition="fixed" />
    </div>
    <div className="fieldGroup"><label htmlFor="creantlCompany">Raison sociale *</label><input id="creantlCompany" value={draft.raison_sociale} onChange={(event) => update('raison_sociale', event.target.value)} maxLength={200} disabled={vm.isSubmitting || Boolean(vm.selectedProspect)} /></div>
    <div className="fieldGroup"><label htmlFor="creantlDate">Date du rendez-vous *</label><input id="creantlDate" type="date" value={draft.date_rdv} min={vm.today} onChange={(event) => update('date_rdv', event.target.value)} disabled={vm.isSubmitting} /></div>
    <div className="fieldGroup"><label htmlFor="creantlTime">Créneau disponible *</label>
      <Select inputId="creantlTime" options={vm.timeOptions} value={vm.selectedTime} onChange={(option) => update('heure_rdv', option?.value || '')} isLoading={vm.loadingSlots || vm.loading} isDisabled={vm.isSubmitting || vm.loadingSlots || vm.loading} styles={bookingSelectStyles} placeholder="Choisir un créneau…" noOptionsMessage={() => 'Aucun créneau disponible pour cette date.'} menuPortalTarget={document.body} menuPosition="fixed" />
      {vm.config?.lead_booking?.allow_manual_time && <input aria-label="Heure libre" type="time" value={draft.heure_rdv} onChange={(event) => update('heure_rdv', event.target.value)} disabled={vm.isSubmitting} />}
    </div>
    <div className="fieldGroup"><label htmlFor="creantlCivility">Civilité</label><select id="creantlCivility" value={draft.interlocuteur_civilite} onChange={(event) => update('interlocuteur_civilite', event.target.value)} disabled={vm.isSubmitting}><option value="">Non précisée</option><option>Monsieur</option><option>Madame</option></select></div>
    <div className="fieldGroup"><label htmlFor="creantlContact">Nom et prénom de l’interlocuteur *</label><input id="creantlContact" value={draft.interlocuteur_nom} onChange={(event) => update('interlocuteur_nom', event.target.value)} maxLength={150} disabled={vm.isSubmitting} /></div>
    <div className="fieldGroup"><label htmlFor="creantlRole">Fonction</label><input id="creantlRole" value={draft.interlocuteur_role} onChange={(event) => update('interlocuteur_role', event.target.value)} maxLength={150} disabled={vm.isSubmitting} /></div>
    <div className="fieldGroup"><label htmlFor="creantlPhone">Téléphone de contact *</label><input id="creantlPhone" type="tel" value={draft.telephone_contact_snapshot} onChange={(event) => update('telephone_contact_snapshot', event.target.value)} maxLength={20} disabled={vm.isSubmitting} /></div>
    <div className="fieldGroup"><label htmlFor="creantlEmail">Email de contact</label><input id="creantlEmail" type="email" value={draft.email_contact_snapshot} onChange={(event) => update('email_contact_snapshot', event.target.value)} maxLength={255} disabled={vm.isSubmitting} /></div>
    <div className="fieldGroup"><label htmlFor="creantlMin">Effectif minimum</label><input id="creantlMin" type="number" min={0} max={1000000} value={draft.effectif_min} onChange={(event) => update('effectif_min', event.target.value)} disabled={vm.isSubmitting} /></div>
    <div className="fieldGroup"><label htmlFor="creantlMax">Effectif maximum</label><input id="creantlMax" type="number" min={0} max={1000000} value={draft.effectif_max} onChange={(event) => update('effectif_max', event.target.value)} disabled={vm.isSubmitting} /></div>
    <div className="fieldGroup"><label htmlFor="creantlAddress">Adresse</label><AddressAutocomplete id="creantlAddress" value={draft.adresse_facturation} onChange={(value) => update('adresse_facturation', value)} onSelectAddress={vm.selectAddress} disabled={vm.isSubmitting} /></div>
    <div className="fieldGroup"><label htmlFor="creantlPostcode">Code postal</label><input id="creantlPostcode" value={draft.code_postal} onChange={(event) => update('code_postal', event.target.value)} maxLength={10} disabled={vm.isSubmitting} /></div>
    <div className="fieldGroup"><label htmlFor="creantlCity">Ville</label><input id="creantlCity" value={draft.ville} onChange={(event) => update('ville', event.target.value)} maxLength={100} disabled={vm.isSubmitting} /></div>
    <div className="fieldGroup"><label htmlFor="creantlCountry">Pays</label><input id="creantlCountry" value={draft.pays} onChange={(event) => update('pays', event.target.value)} maxLength={100} disabled={vm.isSubmitting} /></div>
    <div className="fieldGroup"><label htmlFor="creantlOrigin">Comment le prospect a connu antl ? *</label><Select inputId="creantlOrigin" options={vm.originOptions} value={vm.selectedOrigin} onChange={(option) => update('origine_contact', option?.value || '')} isDisabled={vm.isSubmitting || vm.loading} styles={bookingSelectStyles} placeholder="Choisir une origine…" menuPortalTarget={document.body} menuPosition="fixed" /></div>
    <div className="fieldGroup"><label htmlFor="creantlOriginDetail">Précisions sur l’origine</label><input id="creantlOriginDetail" value={draft.origine_contact_detail} onChange={(event) => update('origine_contact_detail', event.target.value)} maxLength={500} disabled={vm.isSubmitting} placeholder="Réseau, personne, événement, autre…" /></div>
    <div className="fieldGroup"><label htmlFor="creantlNotes">Notes du rendez-vous</label><textarea id="creantlNotes" value={draft.notes} onChange={(event) => update('notes', event.target.value)} maxLength={10000} rows={4} disabled={vm.isSubmitting} /></div>
    {vm.error && <p className="formError" role="alert">{vm.error}</p>}
  </div>;
}
