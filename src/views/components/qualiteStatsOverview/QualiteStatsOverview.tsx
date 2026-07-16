import type { ReactElement } from 'react';
import type { QualiteStatsPageViewModel } from '../../../hooks/index.ts';
import { formatQualitePercent, formatQualiteProgpa } from '../../../utils/scripts/index.ts';
import { QualiteCommercialInsight, QualiteSummaryCard } from '../index.ts';

type QualiteStatsOverviewProps = Pick<
  QualiteStatsPageViewModel,
  'data' | 'periodeSummary' | 'selectedCommercial'
>;

export function QualiteStatsOverview({
  data,
  periodeSummary,
  selectedCommercial,
}: QualiteStatsOverviewProps): ReactElement | null {
  if (!data || !periodeSummary) return null;

  return (
    <>
      <section className="qualiteStats__summary-grid">
        <QualiteSummaryCard title="Moyenne période" value={formatQualiteProgpa(periodeSummary.moyenne_progpa)} subtitle={`${periodeSummary.total_appels} appels analysés`} />
        <QualiteSummaryCard title="Moyenne du jour" value={formatQualiteProgpa(data.synthese.aujourd_hui.moyenne_progpa)} subtitle={`${data.synthese.aujourd_hui.total_appels} appels aujourd’hui`} />
        <QualiteSummaryCard title="Moyenne du mois" value={formatQualiteProgpa(data.synthese.mois_en_cours.moyenne_progpa)} subtitle={`${data.synthese.mois_en_cours.total_appels} appels ce mois`} />
        <QualiteSummaryCard title="Taux de saisie" value={formatQualitePercent(periodeSummary.taux_saisie_progpa)} subtitle={`${periodeSummary.prospects_uniques} prospects uniques`} />
      </section>
      {selectedCommercial && (
        <section className="qualiteStats__panel">
          <div className="qualiteStats__panel-header">
            <div>
              <h2>Focus commercial</h2>
              <p>{selectedCommercial.prenom} {selectedCommercial.nom.toUpperCase()} - {selectedCommercial.identifiant}</p>
            </div>
          </div>
          <QualiteCommercialInsight commercial={selectedCommercial} />
        </section>
      )}
    </>
  );
}
