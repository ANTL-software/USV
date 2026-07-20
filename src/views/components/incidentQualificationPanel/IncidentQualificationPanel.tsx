import type { ReactElement } from 'react';
import type { IncidentQualificationViewModel } from '../../../hooks/index.ts';
import { formatDate } from '../../../utils/scripts/index.ts';
import { formatIncidentEmploye, INCIDENT_STATUT_LABELS } from '../../../utils/types/index.ts';
import { IncidentQualificationForm } from '../incidentQualificationForm/index.ts';

interface IncidentQualificationPanelProps { viewModel: IncidentQualificationViewModel }

export function IncidentQualificationPanel({ viewModel }: IncidentQualificationPanelProps): ReactElement {
  const incident = viewModel.selectedIncident;
  if (!incident) return <section className="incidents__panel"><div className="incidents__empty">Sélectionnez un incident à qualifier.</div></section>;
  return (
    <section className="incidents__panel">
      <div className="incidents__summary">
        <span className={`incidents__badge incidents__badge--${incident.statut}`}>{INCIDENT_STATUT_LABELS[incident.statut]}</span>
        <h2>{incident.titre}</h2><p>{incident.description}</p>
        <dl><div><dt>Déclarant</dt><dd>{formatIncidentEmploye(incident.declarant)}</dd></div><div><dt>Date</dt><dd>{formatDate(incident.created_at)}</dd></div><div><dt>Référence</dt><dd>{incident.reference}</dd></div></dl>
      </div>
      <IncidentQualificationForm viewModel={viewModel} />
    </section>
  );
}
