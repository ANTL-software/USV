import type { ReactElement } from 'react';
import type { ProgpaCommercialStats } from '../../../utils/types/index.ts';
import { formatQualitePercent, formatQualiteProgpa } from '../../../utils/scripts/index.ts';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
}

export function QualiteSummaryCard({ title, value, subtitle }: SummaryCardProps): ReactElement {
  return (
    <article className="qualiteStats__summary-card">
      <span className="qualiteStats__summary-label">{title}</span>
      <strong className="qualiteStats__summary-value">{value}</strong>
      <span className="qualiteStats__summary-subtitle">{subtitle}</span>
    </article>
  );
}

export function QualiteCommercialInsight({ commercial }: { commercial: ProgpaCommercialStats }): ReactElement {
  return (
    <div className="qualiteStats__commercial-focus-grid">
      <QualiteSummaryCard
        title="Moyenne commerciale"
        value={formatQualiteProgpa(commercial.moyenne_progpa)}
        subtitle={`${commercial.total_appels} appels sur la période`}
      />
      <QualiteSummaryCard
        title="Taux de saisie"
        value={formatQualitePercent(commercial.taux_saisie_progpa)}
        subtitle={`${commercial.appels_avec_progpa} appels avec progpa`}
      />
      <QualiteSummaryCard
        title="Plus haut niveau"
        value={`${commercial.max_progpa_atteint} / 5`}
        subtitle="Plus haut progpa atteint"
      />
      <QualiteSummaryCard
        title="Max fiche moyen"
        value={formatQualiteProgpa(commercial.moyenne_max_fiche)}
        subtitle={`${commercial.prospects_uniques} prospects uniques`}
      />
    </div>
  );
}
