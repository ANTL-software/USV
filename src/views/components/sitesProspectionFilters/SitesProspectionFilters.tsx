import type { ReactElement } from 'react';
import type { SitesProspectionViewModel } from '../../../hooks/index.ts';
import { Button } from '../index.ts';

interface SitesProspectionFiltersProps { viewModel: SitesProspectionViewModel }

export function SitesProspectionFilters({ viewModel: vm }: SitesProspectionFiltersProps): ReactElement {
 return (  <section className="sitesProspection__filters" aria-label="Filtres de prospection">
   <label className="sitesProspection__field">Rechercher<input type="search" placeholder="Entreprise, site, SIREN, téléphone…" value={vm.query.q} onChange={e => vm.changeFilter('q', e.target.value)} /></label>
   <label className="sitesProspection__field">Code postal<input placeholder="17, 17290…" value={vm.query.code_postal} onChange={e => vm.changeFilter('code_postal', e.target.value)} /></label>
   <label className="sitesProspection__field">Agence<input placeholder="Incomm, Gogency…" value={vm.query.agence} onChange={e => vm.changeFilter('agence', e.target.value)} /></label>
   <label className="sitesProspection__field">Preuve agence<select value={vm.query.agence_statut} onChange={e => vm.changeFilter('agence_statut', e.target.value)}><option value="">Toutes les preuves</option>{vm.agencyOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
   <label className="sitesProspection__field">Suivi<select value={vm.query.suivi} onChange={e => vm.changeFilter('suivi', e.target.value)}><option value="">Tous les statuts</option>{vm.followupOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
   <label className="sitesProspection__field">État entreprise<select value={vm.query.etat_entreprise} onChange={e => vm.changeFilter('etat_entreprise', e.target.value)}><option value="">Tous les états</option><option>Active</option><option>Cessée</option></select></label>
   <label className="sitesProspection__field">Téléphone fixe<select value={vm.query.avec_telephone} onChange={e => vm.changeFilter('avec_telephone', e.target.value)}><option value="">Toutes les fiches</option><option value="oui">Avec un fixe</option><option value="non">Sans fixe renseigné</option></select></label>
   <label className="sitesProspection__field">Source téléphone<select value={vm.query.telephone_statut} onChange={e => vm.changeFilter('telephone_statut', e.target.value)}><option value="">Toutes les sources</option>{vm.phoneOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
   <Button style="grey" onClick={vm.reset}>Réinitialiser</Button><Button style="gradient" onClick={vm.reload}>Actualiser</Button>
  </section>
);
}
