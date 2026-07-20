import type { ReactElement } from 'react';
import { IoEyeOutline } from 'react-icons/io5';
import type { IncidentListViewModel } from '../../../hooks/index.ts';
import { formatDate } from '../../../utils/scripts/index.ts';
import { formatIncidentEmploye, formatIncidentUtilisateursImpactes, INCIDENT_CRITICITE_LABELS, INCIDENT_PRIORITE_LABELS, INCIDENT_SECTEUR_LABELS, INCIDENT_SOURCE_LABELS, INCIDENT_STATUT_LABELS } from '../../../utils/types/index.ts';

interface IncidentListTableProps { viewModel: IncidentListViewModel }

export function IncidentListTable({ viewModel }: IncidentListTableProps): ReactElement {
  if (viewModel.isLoading) return <div className="incidents__empty">Chargement...</div>;
  return <div className="incidents__table-wrapper"><table className="incidents__table"><thead><tr><th>Référence</th><th>Titre</th><th>Statut</th><th>Secteur</th><th>Source</th><th>Priorité</th><th>Criticité</th><th>Utilisateurs impactés</th><th>Intervenant</th><th>Déclaré le</th><th>Résolu le</th><th>Actions</th></tr></thead><tbody>{viewModel.incidents.map((incident) => <tr key={incident.id_incident}><td><code>{incident.reference}</code></td><td className="incidents__table-title">{incident.titre}</td><td><span className={`incidents__badge incidents__badge--${incident.statut}`}>{INCIDENT_STATUT_LABELS[incident.statut]}</span></td><td>{INCIDENT_SECTEUR_LABELS[incident.secteur]}</td><td>{INCIDENT_SOURCE_LABELS[incident.source]}</td><td><span className={`incidents__badge incidents__badge--priority-${incident.priorite}`}>{INCIDENT_PRIORITE_LABELS[incident.priorite]}</span></td><td>{INCIDENT_CRITICITE_LABELS[incident.criticite]}</td><td>{formatIncidentUtilisateursImpactes(incident)}</td><td>{formatIncidentEmploye(incident.intervenant)}</td><td>{formatDate(incident.created_at)}</td><td>{formatDate(incident.date_resolution)}</td><td><button type="button" className="incidents__btn-icon" title="Consulter" onClick={() => viewModel.navigateToIncident(incident.id_incident)}><IoEyeOutline /></button></td></tr>)}{viewModel.incidents.length === 0 && <tr><td colSpan={12} className="incidents__empty-cell">Aucun incident ne correspond aux filtres.</td></tr>}</tbody></table></div>;
}
