import type { ReactElement } from 'react';
import type { IncidentTreatmentViewModel } from '../../../hooks/index.ts';
import {
  formatIncidentResolutionDuration,
} from '../../../utils/scripts/index.ts';
import {
  formatIncidentEmploye,
  formatIncidentUtilisateursImpactes,
  INCIDENT_CRITICITE_LABELS,
  INCIDENT_PRIORITE_LABELS,
  INCIDENT_SECTEUR_LABELS,
  INCIDENT_STATUT_LABELS,
} from '../../../utils/types/index.ts';

type IncidentTreatmentSidebarProps = Pick<
  IncidentTreatmentViewModel,
  | 'activeIncident'
  | 'incidentsOuverts'
  | 'isLoadingList'
  | 'isReadOnlyHistoryView'
  | 'selectedId'
  | 'setSelectedId'
>;

export function IncidentTreatmentSidebar({
  activeIncident,
  incidentsOuverts,
  isLoadingList,
  isReadOnlyHistoryView,
  selectedId,
  setSelectedId,
}: IncidentTreatmentSidebarProps): ReactElement {
  return (
    <aside className="incidents__sidebar">
      <h2>Incident</h2>
      {!isReadOnlyHistoryView && (
        <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={isLoadingList}>
          <option value="">Sélectionner</option>
          {incidentsOuverts.map((incident) => (
            <option key={incident.id_incident} value={incident.id_incident}>
              {incident.reference} · {incident.titre}
            </option>
          ))}
        </select>
      )}
      {activeIncident && (
        <div className="incidents__meta-list">
          <div><span>Statut</span><strong>{INCIDENT_STATUT_LABELS[activeIncident.statut]}</strong></div>
          <div><span>Secteur</span><strong>{INCIDENT_SECTEUR_LABELS[activeIncident.secteur]}</strong></div>
          <div><span>Priorité</span><strong>{INCIDENT_PRIORITE_LABELS[activeIncident.priorite]}</strong></div>
          <div><span>Criticité</span><strong>{INCIDENT_CRITICITE_LABELS[activeIncident.criticite]}</strong></div>
          <div><span>Intervenant</span><strong>{formatIncidentEmploye(activeIncident.intervenant)}</strong></div>
          <div><span>Utilisateurs impactés</span><strong>{formatIncidentUtilisateursImpactes(activeIncident)}</strong></div>
          <div><span>Durée</span><strong>{formatIncidentResolutionDuration(activeIncident.date_declaration, activeIncident.date_resolution)}</strong></div>
        </div>
      )}
    </aside>
  );
}
