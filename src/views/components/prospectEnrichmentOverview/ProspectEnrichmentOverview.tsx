import type { ReactElement } from 'react';
import type { ProspectEnrichmentSnapshot } from '../../../utils/types/index.ts';
import {
  ENRICHMENT_STATUS_LABELS,
  formatEnrichmentValue,
} from '../../../utils/scripts/index.ts';

interface ProspectEnrichmentOverviewProps {
  snapshot: ProspectEnrichmentSnapshot;
}

export function ProspectEnrichmentOverview({ snapshot }: ProspectEnrichmentOverviewProps): ReactElement {
  return (
    <section className="prospectEnrichment__overview">
      <div className="prospectEnrichment__overviewCard">
        <span>Complétude fiche actuelle</span>
        <strong>{snapshot.completude.fiche_actuelle.percentage}%</strong>
        <small>{snapshot.completude.fiche_actuelle.filled}/{snapshot.completude.fiche_actuelle.total} champs utiles renseignés</small>
      </div>
      <div className="prospectEnrichment__overviewCard">
        <span>Complétude enrichissement</span>
        <strong>{snapshot.completude.enrichissement.percentage}%</strong>
        <small>{snapshot.completude.enrichissement.filled}/{snapshot.completude.enrichissement.total} champs enrichissement renseignés</small>
      </div>
      <div className="prospectEnrichment__overviewCard">
        <span>Statut enrichissement</span>
        <strong className={`prospectEnrichment__statusBadge prospectEnrichment__statusBadge--${snapshot.enrichissement.enrichissement_statut}`}>
          {ENRICHMENT_STATUS_LABELS[snapshot.enrichissement.enrichissement_statut]}
        </strong>
        <small>Score de confiance : {formatEnrichmentValue(snapshot.enrichissement.enrichissement_score)}</small>
      </div>
    </section>
  );
}
