import './incidents.scss';

import { FormEvent, ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoEyeOutline, IoListOutline, IoSearchOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import { useEmployes } from '../../../hooks/useEmployes';
import { useIncidents } from '../../../hooks/useIncidents';
import type {
  IncidentCriticite,
  IncidentFilters,
  IncidentImpact,
  IncidentImpactUtilisateurs,
  IncidentPriorite,
  IncidentSecteur,
  IncidentSource,
  IncidentStatut,
} from '../../../utils/types/incident.types';
import {
  formatIncidentEmploye,
  formatIncidentUtilisateursImpactes,
  INCIDENT_CRITICITE_LABELS,
  INCIDENT_CRITICITE_OPTIONS,
  INCIDENT_IMPACT_OPTIONS,
  INCIDENT_IMPACT_UTILISATEURS_OPTIONS,
  INCIDENT_PRIORITE_LABELS,
  INCIDENT_PRIORITE_OPTIONS,
  INCIDENT_SECTEUR_LABELS,
  INCIDENT_SECTEUR_OPTIONS,
  INCIDENT_SOURCE_LABELS,
  INCIDENT_SOURCE_OPTIONS,
  INCIDENT_STATUT_LABELS,
  INCIDENT_STATUT_OPTIONS,
} from '../../../utils/types/incident.types';
import { formatDate } from '../../../utils/scripts/formatters';
import IncidentSelect from './IncidentSelect';

import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

interface DraftFilters {
  search: string;
  statut: IncidentStatut | 'tous';
  secteur: IncidentSecteur | 'tous';
  source: IncidentSource | 'tous';
  criticite: IncidentCriticite | 'tous';
  priorite: IncidentPriorite | 'tous';
  impact: IncidentImpact | 'tous';
  impact_utilisateurs: IncidentImpactUtilisateurs | 'tous_filtres';
  id_utilisateur_impacte: string;
  id_intervenant: string;
  date_debut: string;
  date_fin: string;
}

const INITIAL_FILTERS: DraftFilters = {
  search: '',
  statut: 'tous',
  secteur: 'tous',
  source: 'tous',
  criticite: 'tous',
  priorite: 'tous',
  impact: 'tous',
  impact_utilisateurs: 'tous_filtres',
  id_utilisateur_impacte: 'tous',
  id_intervenant: 'tous',
  date_debut: '',
  date_fin: '',
};

function IncidentList(): ReactElement {
  const navigate = useNavigate();
  const { employes } = useEmployes();
  const { incidents, pagination, isLoading, error, setFilters, filters } = useIncidents({ limit: 25, page: 1 });
  const [draft, setDraft] = useState<DraftFilters>(INITIAL_FILTERS);

  const updateDraft = <K extends keyof DraftFilters>(field: K, value: DraftFilters[K]) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextFilters: IncidentFilters = {
      search: draft.search.trim() || undefined,
      statut: draft.statut,
      secteur: draft.secteur,
      source: draft.source,
      criticite: draft.criticite,
      priorite: draft.priorite,
      impact: draft.impact,
      impact_utilisateurs: draft.impact_utilisateurs,
      id_utilisateur_impacte: draft.id_utilisateur_impacte === 'tous' ? 'tous' : Number(draft.id_utilisateur_impacte),
      id_intervenant: draft.id_intervenant === 'tous' ? 'tous' : Number(draft.id_intervenant),
      date_debut: draft.date_debut || undefined,
      date_fin: draft.date_fin || undefined,
      page: 1,
      limit: filters.limit ?? 25,
    };
    setFilters(nextFilters);
  };

  const resetFilters = () => {
    setDraft(INITIAL_FILTERS);
    setFilters({ page: 1, limit: filters.limit ?? 25 });
  };

  const goToPage = (page: number) => {
    setFilters({ ...filters, page });
  };

  const employeOptions = employes
    .filter(employe => employe.actif)
    .map(employe => ({ value: String(employe.id_employe), label: `${employe.prenom} ${employe.nom.toUpperCase()} (${employe.identifiant})` }));

  const statutOptions = [{ value: 'tous' as const, label: 'Tous' }, ...INCIDENT_STATUT_OPTIONS];
  const secteurOptions = [{ value: 'tous' as const, label: 'Tous' }, ...INCIDENT_SECTEUR_OPTIONS];
  const sourceOptions = [{ value: 'tous' as const, label: 'Toutes' }, ...INCIDENT_SOURCE_OPTIONS];
  const criticiteOptions = [{ value: 'tous' as const, label: 'Toutes' }, ...INCIDENT_CRITICITE_OPTIONS];
  const prioriteOptions = [{ value: 'tous' as const, label: 'Toutes' }, ...INCIDENT_PRIORITE_OPTIONS];
  const impactOptions = [{ value: 'tous' as const, label: 'Tous' }, ...INCIDENT_IMPACT_OPTIONS];
  const impactUtilisateursOptions = [
    { value: 'tous_filtres' as const, label: 'Tous' },
    ...INCIDENT_IMPACT_UTILISATEURS_OPTIONS
  ];
  const employeFilterOptions = [{ value: 'tous', label: 'Tous' }, ...employeOptions];

  return (
    <div id="incidentList">
      <Header />
      <SubNav />
      <main>
        <div className="incidents__container incidents__container--wide">
          <div className="incidents__header">
            <Button style="back" onClick={() => navigate('/incidents')}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
            <h1><IoListOutline /> Liste des incidents</h1>
          </div>

          {error && <div className="incidents__error">{error}</div>}

          <form className="incidents__filters" onSubmit={applyFilters}>
            <div className="incidents__field incidents__field--search">
              <label htmlFor="search">Recherche globale</label>
              <div className="incidents__search">
                <IoSearchOutline />
                <input
                  id="search"
                  value={draft.search}
                  onChange={event => updateDraft('search', event.target.value)}
                  placeholder="Référence, titre, description, solution..."
                />
              </div>
            </div>

            <div className="incidents__field">
              <label htmlFor="statut">Statut</label>
              <IncidentSelect inputId="statut" options={statutOptions} value={draft.statut} onChange={value => updateDraft('statut', (value ?? 'tous') as IncidentStatut | 'tous')} />
            </div>

            <div className="incidents__field">
              <label htmlFor="secteur">Secteur</label>
              <IncidentSelect inputId="secteur" options={secteurOptions} value={draft.secteur} onChange={value => updateDraft('secteur', (value ?? 'tous') as IncidentSecteur | 'tous')} />
            </div>

            <div className="incidents__field">
              <label htmlFor="source">Source</label>
              <IncidentSelect inputId="source" options={sourceOptions} value={draft.source} onChange={value => updateDraft('source', (value ?? 'tous') as IncidentSource | 'tous')} />
            </div>

            <div className="incidents__field">
              <label htmlFor="criticite">Criticité</label>
              <IncidentSelect inputId="criticite" options={criticiteOptions} value={draft.criticite} onChange={value => updateDraft('criticite', (value ?? 'tous') as IncidentCriticite | 'tous')} />
            </div>

            <div className="incidents__field">
              <label htmlFor="priorite">Priorité</label>
              <IncidentSelect inputId="priorite" options={prioriteOptions} value={draft.priorite} onChange={value => updateDraft('priorite', (value ?? 'tous') as IncidentPriorite | 'tous')} />
            </div>

            <div className="incidents__field">
              <label htmlFor="impact">Impact</label>
              <IncidentSelect inputId="impact" options={impactOptions} value={draft.impact} onChange={value => updateDraft('impact', (value ?? 'tous') as IncidentImpact | 'tous')} />
            </div>

            <div className="incidents__field">
              <label htmlFor="impact_utilisateurs_filter">Utilisateurs impactés</label>
              <IncidentSelect
                inputId="impact_utilisateurs_filter"
                options={impactUtilisateursOptions}
                value={draft.impact_utilisateurs}
                onChange={value => updateDraft('impact_utilisateurs', (value ?? 'tous_filtres') as IncidentImpactUtilisateurs | 'tous_filtres')}
              />
            </div>

            <div className="incidents__field">
              <label htmlFor="utilisateur_impacte_filter">Utilisateur impacté</label>
              <IncidentSelect
                inputId="utilisateur_impacte_filter"
                options={employeFilterOptions}
                value={draft.id_utilisateur_impacte}
                onChange={value => updateDraft('id_utilisateur_impacte', value ?? 'tous')}
              />
            </div>

            <div className="incidents__field">
              <label htmlFor="intervenant">Intervenant</label>
              <IncidentSelect
                inputId="intervenant"
                options={employeFilterOptions}
                value={draft.id_intervenant}
                onChange={value => updateDraft('id_intervenant', value ?? 'tous')}
              />
            </div>

            <div className="incidents__field">
              <label htmlFor="date_debut">Depuis</label>
              <input id="date_debut" type="date" value={draft.date_debut} onChange={event => updateDraft('date_debut', event.target.value)} />
            </div>

            <div className="incidents__field">
              <label htmlFor="date_fin">Jusqu’au</label>
              <input id="date_fin" type="date" value={draft.date_fin} onChange={event => updateDraft('date_fin', event.target.value)} />
            </div>

            <div className="incidents__filter-actions">
              <button type="submit" className="incidents__btn-primary">Filtrer</button>
              <button type="button" className="incidents__btn-secondary" onClick={resetFilters}>Réinitialiser</button>
            </div>
          </form>

          <div className="incidents__table-header">
            <p>{pagination.total} incident{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}</p>
          </div>

          {isLoading ? (
            <div className="incidents__empty">Chargement...</div>
          ) : (
            <div className="incidents__table-wrapper">
              <table className="incidents__table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Titre</th>
                    <th>Statut</th>
                    <th>Secteur</th>
                    <th>Source</th>
                    <th>Priorité</th>
                    <th>Criticité</th>
                    <th>Utilisateurs impactés</th>
                    <th>Intervenant</th>
                    <th>Déclaré le</th>
                    <th>Résolu le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map(incident => (
                    <tr key={incident.id_incident}>
                      <td><code>{incident.reference}</code></td>
                      <td className="incidents__table-title">{incident.titre}</td>
                      <td><span className={`incidents__badge incidents__badge--${incident.statut}`}>{INCIDENT_STATUT_LABELS[incident.statut]}</span></td>
                      <td>{INCIDENT_SECTEUR_LABELS[incident.secteur]}</td>
                      <td>{INCIDENT_SOURCE_LABELS[incident.source]}</td>
                      <td><span className={`incidents__badge incidents__badge--priority-${incident.priorite}`}>{INCIDENT_PRIORITE_LABELS[incident.priorite]}</span></td>
                      <td>{INCIDENT_CRITICITE_LABELS[incident.criticite]}</td>
                      <td>{formatIncidentUtilisateursImpactes(incident)}</td>
                      <td>{formatIncidentEmploye(incident.intervenant)}</td>
                      <td>{formatDate(incident.created_at)}</td>
                      <td>{formatDate(incident.date_resolution)}</td>
                      <td>
                        <button
                          type="button"
                          className="incidents__btn-icon"
                          title="Consulter"
                          onClick={() => navigate(`/incidents/traitement/${incident.id_incident}`)}
                        >
                          <IoEyeOutline />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {incidents.length === 0 && (
                    <tr>
                      <td colSpan={12} className="incidents__empty-cell">Aucun incident ne correspond aux filtres.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="incidents__pagination">
            <button type="button" onClick={() => goToPage(Math.max(1, pagination.page - 1))} disabled={pagination.page <= 1}>
              Précédent
            </button>
            <span>Page {pagination.page} / {pagination.totalPages}</span>
            <button type="button" onClick={() => goToPage(Math.min(pagination.totalPages, pagination.page + 1))} disabled={pagination.page >= pagination.totalPages}>
              Suivant
            </button>
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const IncidentListWithAuth = WithAuth(IncidentList);
export default IncidentListWithAuth;
