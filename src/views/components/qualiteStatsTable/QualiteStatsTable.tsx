import type { ReactElement } from 'react';
import type { QualiteStatsPageViewModel } from '../../../hooks/index.ts';
import { formatQualiteDateLong, formatQualitePercent, formatQualiteProgpa } from '../../../utils/scripts/index.ts';

type QualiteStatsTableProps = Pick<QualiteStatsPageViewModel, 'data'>;

export function QualiteStatsTable({ data }: QualiteStatsTableProps): ReactElement | null {
  if (!data) return null;
  const finalStepLabel = data.etapes.find((step) => step.progpa === 5)?.label || 'Étape finale';

  return (
    <section className="qualiteStats__panel">
      <div className="qualiteStats__panel-header">
        <div>
          <h2>Détail journalier par commercial</h2>
          <p>Une ligne par TLV et par jour, avec toutes les étapes détaillées.</p>
        </div>
      </div>
      <div className="qualiteStats__table-wrap">
        <table className="qualiteStats__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Commercial</th>
              <th>Total</th>
              <th>Aucun contact</th>
              <th>Identification</th>
              <th>Présentation</th>
              <th>Découverte</th>
              <th>Proposition</th>
              <th>{finalStepLabel}</th>
              <th>{data.suivi_en_cours.label}</th>
              <th>Avec progression</th>
              <th>ProgPA moyen</th>
            </tr>
          </thead>
          <tbody>
            {data.par_commercial_jour.length === 0 && (
              <tr><td colSpan={12} className="qualiteStats__empty-row">Aucun appel clôturé sur cette période.</td></tr>
            )}
            {data.par_commercial_jour.map((row) => (
              <tr key={`${row.date}-${row.id_employe}`}>
                <td className="qualiteStats__date-cell">{formatQualiteDateLong(row.date)}</td>
                <td><strong>{row.prenom} {row.nom.toUpperCase()}</strong><span>{row.identifiant}</span></td>
                <td className="qualiteStats__total-cell">{row.total_appels}</td>
                <td>{row.niveaux.niveau_0}</td>
                <td>{row.niveaux.niveau_1}</td>
                <td>{row.niveaux.niveau_2}</td>
                <td>{row.niveaux.niveau_3}</td>
                <td>{row.niveaux.niveau_4}</td>
                <td>{row.niveaux.niveau_5}</td>
                <td className="qualiteStats__followup-cell">{row.suivis_en_cours}</td>
                <td><strong>{row.appels_avec_progression}</strong><span>{formatQualitePercent(row.taux_progression)}</span></td>
                <td>{formatQualiteProgpa(row.moyenne_progpa)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
