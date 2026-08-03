import type { CSSProperties, ReactElement } from 'react';
import type { QualiteStatsPageViewModel } from '../../../hooks/index.ts';
import { QUALITE_FOLLOWUP_COLOR, formatQualitePercent, formatQualiteProgpa, getQualiteStepColor } from '../../../utils/scripts/index.ts';

type QualiteStatsOverviewProps = Pick<QualiteStatsPageViewModel, 'data'>;

export function QualiteStatsOverview({ data }: QualiteStatsOverviewProps): ReactElement | null {
  if (!data) return null;
  const summary = data.synthese;

  return (
    <>
      <section className="qualiteStats__kpi-grid">
        <article className="qualiteStats__kpi-card"><span>Appels clôturés</span><strong>{summary.total_appels}</strong><small>{summary.prospects_uniques} prospects uniques</small></article>
        <article className="qualiteStats__kpi-card"><span>Non traités</span><strong>{summary.niveaux.niveau_0}</strong><small>ProgPA 0 · aucun contact</small></article>
        <article className="qualiteStats__kpi-card"><span>Avec progression</span><strong>{summary.appels_avec_progression}</strong><small>{formatQualitePercent(summary.taux_progression)} des appels</small></article>
        <article className="qualiteStats__kpi-card qualiteStats__kpi-card--followup"><span>Appels de suivi</span><strong>{summary.suivis_en_cours}</strong><small>5+ · hors ProgPA 0–5</small></article>
        <article className="qualiteStats__kpi-card"><span>ProgPA moyen</span><strong>{formatQualiteProgpa(summary.moyenne_progpa)}</strong><small>Hors appels de suivi</small></article>
      </section>

      <section className="qualiteStats__steps-card">
        <div className="qualiteStats__section-heading"><div><h2>Toutes les étapes</h2><p>Le nombre correspond au niveau exact enregistré au closing.</p></div><span>{data.campagne.nom_campagne}</span></div>
        <div className="qualiteStats__steps-grid">
          {data.etapes.map((step) => (
            <article key={step.progpa} className="qualiteStats__step" style={{ '--step-color': getQualiteStepColor(step.progpa) } as CSSProperties}>
              <span className="qualiteStats__step-index">{step.progpa}</span>
              <div><strong>{step.nombre}</strong><span>{step.label}</span><small>{formatQualitePercent(step.pourcentage)}</small></div>
            </article>
          ))}
          <article className="qualiteStats__step qualiteStats__step--followup" style={{ '--step-color': QUALITE_FOLLOWUP_COLOR } as CSSProperties}>
            <span className="qualiteStats__step-index">5+</span>
            <div><strong>{data.suivi_en_cours.nombre}</strong><span>{data.suivi_en_cours.label}</span><small>{formatQualitePercent(data.suivi_en_cours.pourcentage)}</small></div>
          </article>
        </div>
      </section>
    </>
  );
}
