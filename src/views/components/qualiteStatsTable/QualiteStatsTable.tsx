import type { ReactElement } from 'react';
import type { QualiteStatsPageViewModel } from '../../../hooks/index.ts';
import { formatQualitePercent, formatQualiteProgpa } from '../../../utils/scripts/index.ts';

type QualiteStatsTableProps = Pick<
  QualiteStatsPageViewModel,
  'data' | 'selectedCommercial'
>;

export function QualiteStatsTable({ data, selectedCommercial }: QualiteStatsTableProps): ReactElement | null {
  if (!data) return null;

  return (
    <section className="qualiteStats__panel">
      <div className="qualiteStats__panel-header">
        <div><h2>Détail par commercial</h2><p>Vue exploitable pour les KPI individuels et le pilotage qualité</p></div>
      </div>
      <div className="qualiteStats__table-wrap">
        <table className="qualiteStats__table">
          <thead>
            <tr><th>Commercial</th><th>Moyenne</th><th>Max atteint</th><th>Appels</th><th>Prospects</th><th>Taux saisie</th><th>Max fiche moyen</th></tr>
          </thead>
          <tbody>
            {data.commerciaux.length === 0 && (
              <tr><td colSpan={7} className="qualiteStats__empty-row">Aucune donnée disponible sur cette période</td></tr>
            )}
            {data.commerciaux.map((commercial) => (
              <tr key={commercial.id_employe} className={selectedCommercial?.id_employe === commercial.id_employe ? 'is-selected' : ''}>
                <td><strong>{commercial.prenom} {commercial.nom.toUpperCase()}</strong><span>Matricule : {commercial.id_employe}</span></td>
                <td>{formatQualiteProgpa(commercial.moyenne_progpa)}</td>
                <td>{commercial.max_progpa_atteint} / 5</td>
                <td>{commercial.total_appels}</td>
                <td>{commercial.prospects_uniques}</td>
                <td>{formatQualitePercent(commercial.taux_saisie_progpa)}</td>
                <td>{formatQualiteProgpa(commercial.moyenne_max_fiche)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
