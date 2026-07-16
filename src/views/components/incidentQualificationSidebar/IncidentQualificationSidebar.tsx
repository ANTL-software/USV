import type { ReactElement } from 'react';
import type { IncidentQualificationViewModel } from '../../../hooks/index.ts';
import { INCIDENT_SECTEUR_LABELS, INCIDENT_STATUT_LABELS } from '../../../utils/types/index.ts';

interface IncidentQualificationSidebarProps { viewModel: IncidentQualificationViewModel }

export function IncidentQualificationSidebar({ viewModel }: IncidentQualificationSidebarProps): ReactElement {
  return (
    <aside className="incidents__sidebar">
      <h2>À qualifier</h2>
      {viewModel.isLoading ? <p>Chargement...</p> : viewModel.incidentsToQualify.length === 0 ? <p>Aucun incident à qualifier.</p> : (
        <div className="incidents__selection-list">
          {viewModel.incidentsToQualify.map((incident) => (
            <button key={incident.id_incident} type="button" className={viewModel.selectedId === String(incident.id_incident) ? 'active' : ''} onClick={() => viewModel.selectIncident(String(incident.id_incident))}>
              <strong>{incident.reference}</strong><span>{incident.titre}</span><small>{INCIDENT_SECTEUR_LABELS[incident.secteur]} · {INCIDENT_STATUT_LABELS[incident.statut]}</small>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
