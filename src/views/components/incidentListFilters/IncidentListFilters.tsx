import type { ReactElement } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import type { IncidentListViewModel } from '../../../hooks/index.ts';
import { prependSelectOption } from '../../../utils/scripts/index.ts';
import type { IncidentCriticite, IncidentImpact, IncidentImpactUtilisateurs, IncidentPriorite, IncidentSecteur, IncidentSource, IncidentStatut } from '../../../utils/types/index.ts';
import { INCIDENT_CRITICITE_OPTIONS, INCIDENT_IMPACT_OPTIONS, INCIDENT_IMPACT_UTILISATEURS_OPTIONS, INCIDENT_PRIORITE_OPTIONS, INCIDENT_SECTEUR_OPTIONS, INCIDENT_SOURCE_OPTIONS, INCIDENT_STATUT_OPTIONS } from '../../../utils/types/index.ts';
import { IncidentSelect } from '../incidentSelect/index.ts';

interface IncidentListFiltersProps { viewModel: IncidentListViewModel }

export function IncidentListFilters({ viewModel }: IncidentListFiltersProps): ReactElement {
  return <form className="incidents__filters" onSubmit={viewModel.applyFilters}>
    <div className="incidents__field incidents__field--search"><label htmlFor="search">Recherche globale</label><div className="incidents__search"><IoSearchOutline /><input id="search" value={viewModel.draft.search} onChange={(event) => viewModel.updateDraft('search', event.target.value)} placeholder="Référence, titre, description, solution..." /></div></div>
    <div className="incidents__field"><label htmlFor="statut">Statut</label><IncidentSelect inputId="statut" options={prependSelectOption(INCIDENT_STATUT_OPTIONS, 'tous', 'Tous')} value={viewModel.draft.statut} onChange={(value) => viewModel.updateDraft('statut', (value ?? 'tous') as IncidentStatut | 'tous')} /></div>
    <div className="incidents__field"><label htmlFor="secteur">Secteur</label><IncidentSelect inputId="secteur" options={prependSelectOption(INCIDENT_SECTEUR_OPTIONS, 'tous', 'Tous')} value={viewModel.draft.secteur} onChange={(value) => viewModel.updateDraft('secteur', (value ?? 'tous') as IncidentSecteur | 'tous')} /></div>
    <div className="incidents__field"><label htmlFor="source">Source</label><IncidentSelect inputId="source" options={prependSelectOption(INCIDENT_SOURCE_OPTIONS, 'tous', 'Toutes')} value={viewModel.draft.source} onChange={(value) => viewModel.updateDraft('source', (value ?? 'tous') as IncidentSource | 'tous')} /></div>
    <div className="incidents__field"><label htmlFor="criticite">Criticité</label><IncidentSelect inputId="criticite" options={prependSelectOption(INCIDENT_CRITICITE_OPTIONS, 'tous', 'Toutes')} value={viewModel.draft.criticite} onChange={(value) => viewModel.updateDraft('criticite', (value ?? 'tous') as IncidentCriticite | 'tous')} /></div>
    <div className="incidents__field"><label htmlFor="priorite">Priorité</label><IncidentSelect inputId="priorite" options={prependSelectOption(INCIDENT_PRIORITE_OPTIONS, 'tous', 'Toutes')} value={viewModel.draft.priorite} onChange={(value) => viewModel.updateDraft('priorite', (value ?? 'tous') as IncidentPriorite | 'tous')} /></div>
    <div className="incidents__field"><label htmlFor="impact">Impact</label><IncidentSelect inputId="impact" options={prependSelectOption(INCIDENT_IMPACT_OPTIONS, 'tous', 'Tous')} value={viewModel.draft.impact} onChange={(value) => viewModel.updateDraft('impact', (value ?? 'tous') as IncidentImpact | 'tous')} /></div>
    <div className="incidents__field"><label htmlFor="impact_utilisateurs_filter">Utilisateurs impactés</label><IncidentSelect inputId="impact_utilisateurs_filter" options={[{ value: 'tous_filtres', label: 'Tous' }, ...INCIDENT_IMPACT_UTILISATEURS_OPTIONS]} value={viewModel.draft.impact_utilisateurs} onChange={(value) => viewModel.updateDraft('impact_utilisateurs', (value ?? 'tous_filtres') as IncidentImpactUtilisateurs | 'tous_filtres')} /></div>
    <div className="incidents__field"><label htmlFor="utilisateur_impacte_filter">Utilisateur impacté</label><IncidentSelect inputId="utilisateur_impacte_filter" options={viewModel.employeeOptions} value={viewModel.draft.id_utilisateur_impacte} onChange={(value) => viewModel.updateDraft('id_utilisateur_impacte', value ?? 'tous')} /></div>
    <div className="incidents__field"><label htmlFor="intervenant">Intervenant</label><IncidentSelect inputId="intervenant" options={viewModel.employeeOptions} value={viewModel.draft.id_intervenant} onChange={(value) => viewModel.updateDraft('id_intervenant', value ?? 'tous')} /></div>
    <div className="incidents__field"><label htmlFor="date_debut">Depuis</label><input id="date_debut" type="date" value={viewModel.draft.date_debut} onChange={(event) => viewModel.updateDraft('date_debut', event.target.value)} /></div>
    <div className="incidents__field"><label htmlFor="date_fin">Jusqu’au</label><input id="date_fin" type="date" value={viewModel.draft.date_fin} onChange={(event) => viewModel.updateDraft('date_fin', event.target.value)} /></div>
    <div className="incidents__filter-actions"><button type="submit" className="incidents__btn-primary">Filtrer</button><button type="button" className="incidents__btn-secondary" onClick={viewModel.resetFilters}>Réinitialiser</button></div>
  </form>;
}
