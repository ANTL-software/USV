import type { ReactElement } from 'react';
import type { IncidentTreatmentViewModel } from '../../../hooks/index.ts';
import { formatDate } from '../../../utils/scripts/index.ts';
import {
  formatIncidentEmploye,
  formatIncidentUtilisateursImpactes,
  INCIDENT_STATUT_LABELS,
} from '../../../utils/types/index.ts';
import {
  IncidentTreatmentComments,
  IncidentTreatmentForm,
} from '../index.ts';

interface IncidentTreatmentContentProps {
  viewModel: IncidentTreatmentViewModel;
}

export function IncidentTreatmentContent({ viewModel }: IncidentTreatmentContentProps): ReactElement {
  const { activeIncident } = viewModel;

  if (viewModel.isLoading) {
    return <section className="incidents__panel"><div className="incidents__empty">Chargement...</div></section>;
  }
  if (!activeIncident) {
    return <section className="incidents__panel"><div className="incidents__empty">Sélectionnez un incident à traiter.</div></section>;
  }

  return (
    <section className="incidents__panel">
      <div className="incidents__summary">
        <span className={`incidents__badge incidents__badge--${activeIncident.statut}`}>{INCIDENT_STATUT_LABELS[activeIncident.statut]}</span>
        <h2>{activeIncident.reference} · {activeIncident.titre}</h2>
        <p>{activeIncident.description}</p>
        <dl>
          <div><dt>Déclarant</dt><dd>{formatIncidentEmploye(activeIncident.declarant)}</dd></div>
          <div><dt>Créé le</dt><dd>{formatDate(activeIncident.created_at)}</dd></div>
          <div><dt>Utilisateurs impactés</dt><dd>{formatIncidentUtilisateursImpactes(activeIncident)}</dd></div>
          <div><dt>Classification</dt><dd>{activeIncident.classification ?? '—'}</dd></div>
        </dl>
      </div>

      {viewModel.canTraiter && !viewModel.isReadOnlyHistoryView ? (
        <IncidentTreatmentForm {...viewModel} />
      ) : (
        <div className="incidents__empty">Consultation seule pour ce poste.</div>
      )}
      <IncidentTreatmentComments {...viewModel} />
    </section>
  );
}
