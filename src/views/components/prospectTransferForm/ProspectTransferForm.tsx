import Select from 'react-select';
import { FaArrowRight } from 'react-icons/fa';
import type { ProspectTransferViewModel } from '../../../hooks/index.ts';
import { Button } from '../index.ts';
const statuses = [{ value: null, label: 'Tous les statuts' }, ...[['nouveau', 'Nouveau'], ['contacte', 'Contacté'], ['interesse', 'Intéressé'], ['rappel', 'Rappel'], ['non_interesse', 'Non intéressé'], ['vente_conclue', 'Vente conclue']].map(([value, label]) => ({ value, label }))];
export function ProspectTransferForm({ vm }: { vm: ProspectTransferViewModel }) {
  return <section className="prospectTransfer__card" aria-label="Sélection du portefeuille">
    <fieldset disabled={vm.busy || vm.loadingOptions}>
      <legend>De quel commercial vers quel commercial ?</legend>
      <div className="prospectTransfer__direction">
        <div><label htmlFor="transfer-source">Commercial source (sortie)</label><Select inputId="transfer-source" classNamePrefix="reactSelect" options={vm.commercialOptions} value={vm.commercialOptions.find(o => o.value === vm.criteria.id_source) ?? null} onChange={o => vm.change('id_source', o?.value ?? 0)} isDisabled={vm.busy || vm.loadingOptions} placeholder="Commercial qui cède ses prospects" /></div>
        <FaArrowRight aria-label="Vers le destinataire" />
        <div><label htmlFor="transfer-destination">Commercial destinataire (entrée)</label><Select inputId="transfer-destination" classNamePrefix="reactSelect" options={vm.destinationOptions} value={vm.destinationOptions.find(o => o.value === vm.criteria.id_destination) ?? null} onChange={o => vm.change('id_destination', o?.value ?? 0)} isDisabled={vm.busy || vm.loadingOptions} placeholder="Commercial qui reprend le suivi" /></div>
      </div>
      {vm.criteria.previous_transfer_id && <p role="status">Restitution du transfert {vm.criteria.previous_transfer_id}. Seuls les prospects encore affectés au commercial source sont proposés.</p>}
      <div className="prospectTransfer__filters">
        <div><label htmlFor="transfer-campaign">Campagne</label><Select inputId="transfer-campaign" classNamePrefix="reactSelect" options={vm.campaignOptions} value={vm.campaignOptions.find(o => o.value === vm.criteria.id_campagne)} onChange={o => vm.change('id_campagne', o?.value ?? null)} isDisabled={vm.busy} /></div>
        <div><label htmlFor="transfer-type">Type de prospect</label><select id="transfer-type" value={vm.criteria.type_prospect ?? ''} onChange={e => vm.change('type_prospect', e.target.value === 'Entreprise' ? 'Entreprise' : e.target.value === 'Particulier' ? 'Particulier' : null)}><option value="">Tous les types</option><option>Entreprise</option><option>Particulier</option></select></div>
        <div><label htmlFor="transfer-status">Statut du prospect</label><Select inputId="transfer-status" classNamePrefix="reactSelect" options={statuses} value={statuses.find(o => o.value === vm.criteria.statut)} onChange={o => vm.change('statut', o?.value ?? null)} isDisabled={vm.busy} /></div>
        <div><label htmlFor="transfer-rdv">Rendez-vous à reprendre</label><select id="transfer-rdv" value={vm.criteria.rendez_vous} onChange={e => vm.change('rendez_vous', e.target.value as 'all' | 'yes' | 'no')}><option value="all">Avec ou sans rendez-vous</option><option value="yes">Avec rendez-vous ou rappel Vigie</option><option value="no">Sans rendez-vous ni rappel Vigie</option></select></div>
        <div><label htmlFor="transfer-sale">Commandes du prospect</label><select id="transfer-sale" value={vm.criteria.commande} onChange={e => vm.change('commande', e.target.value as 'all' | 'none' | 'en_attente' | 'frigo')}><option value="all">Toutes les situations</option><option value="en_attente">Avec commande en attente</option><option value="frigo">Avec commande au frigo</option><option value="none">Sans commande en attente ni au frigo</option></select></div>
      </div>
      <div className="prospectTransfer__motif">
        <label htmlFor="transfer-motif">Motif du transfert (obligatoire)</label>
        <textarea id="transfer-motif" required value={vm.motif} maxLength={2000} rows={3} onChange={e => vm.changeMotif(e.target.value)} />
      </div>
      <Button style="grey" onClick={vm.resetFilters}>Réinitialiser les filtres / tout le portefeuille</Button>
      <div className="prospectTransfer__counts" aria-live="polite">
        {vm.counting ? 'Comptage en cours…' : vm.counts ? <><strong>{vm.counts.total.toLocaleString('fr-FR')} prospects au total</strong><strong>{vm.counts.filtered.toLocaleString('fr-FR')} avec les filtres</strong></> : 'Choisir un commercial source pour compter son portefeuille.'}
      </div>
      <div className="prospectTransfer__selection">
        <label><input type="radio" name="transfer-selection" checked={!vm.usePortion} onChange={() => vm.changeUsePortion(false)} /> Toute la sélection filtrée</label>
        <label><input type="radio" name="transfer-selection" checked={vm.usePortion} onChange={() => vm.changeUsePortion(true)} /> Une portion</label>
        {vm.usePortion && <div><label htmlFor="transfer-portion">Nombre de prospects</label><input id="transfer-portion" type="number" min="1" max="50000" value={vm.portion} onChange={e => vm.changePortion(e.target.value)} />{!vm.validPortion && <p role="alert">Saisir un nombre entier entre 1 et 50 000.</p>}</div>}
      </div>
      <p>Les portions suivent l’ordre des identifiants prospects. Jusqu’à 50 000 prospects par transfert.</p>
      <Button style="gradient" disabled={!vm.canPreview} onClick={() => void vm.analyze()}>{vm.busy ? 'Traitement en cours…' : 'Prévisualiser le transfert'}</Button>
    </fieldset>
  </section>;
}
