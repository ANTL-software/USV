import type { ReactElement } from 'react';
import { IoChevronDownOutline, IoChevronUpOutline, IoStatsChartOutline } from 'react-icons/io5';

import type { VigieViewState } from '../../../hooks/index.ts';
import { formatVigieDistance, formatVigieNumber } from '../../../utils/scripts/index.ts';

interface VigieScoringProps {
  state: VigieViewState;
}

const SCORE_CLASSES = ['P1', 'P2', 'P3', 'P4', 'P5'] as const;

export function VigieScoring({ state }: VigieScoringProps): ReactElement | null {
  const { snapshot } = state;
  if (!snapshot) return null;
  return (
    <section className="vigieView__panel vigieView__scoring">
      <div className="vigieView__panel-title vigieView__panel-title--split">
        <IoStatsChartOutline /><div><h2>Potentiel relatif des fiches</h2><p>{snapshot.scoring.disclaimer}</p></div>
        <div className="vigieView__scoring-controls"><span className="vigieView__version">{snapshot.scoring.version}</span>
          <button className="vigieView__disclosure" type="button" aria-expanded={state.isScoringExpanded} aria-controls="vigie-scoring-detail" onClick={() => state.setIsScoringExpanded((expanded) => !expanded)}><span>{state.isScoringExpanded ? 'Masquer le détail' : 'Voir le détail'}</span>{state.isScoringExpanded ? <IoChevronUpOutline aria-hidden="true" /> : <IoChevronDownOutline aria-hidden="true" />}</button>
        </div>
      </div>
      {state.isScoringExpanded && (
        <div id="vigie-scoring-detail" className="vigieView__scoring-detail">
          <div className="vigieView__score-distribution">
            {SCORE_CLASSES.map((scoreClass) => {
              const distribution = snapshot.scoring.distribution.find(({ classe }) => classe === scoreClass);
              return <article key={scoreClass} className={`vigieView__score-card vigieView__score-card--${scoreClass.toLowerCase()}`}><strong>{scoreClass}</strong><span>{formatVigieNumber(distribution?.fiches || 0)} fiches</span><small>{distribution ? `score ${distribution.score_min}–${distribution.score_max}` : 'aucune fiche'}</small></article>;
            })}
          </div>
          <div className="vigieView__selection-bar"><strong>{state.selectedCandidates.length} fiche(s) sélectionnée(s)</strong><span>L’ordre du classement P1–P5 devient l’ordre de distribution au commercial.</span><button className="vigieView__button vigieView__button--ghost" type="button" disabled={state.selectedCandidates.length === 0} onClick={() => state.setSelectedProspectIds([])}>Vider la sélection</button></div>
          <div className="vigieView__table-wrap"><table>
            <thead><tr><th className="vigieView__check-cell"><input type="checkbox" aria-label="Sélectionner toutes les fiches proposées" checked={snapshot.scoring.candidats.length > 0 && state.selectedCandidates.length === snapshot.scoring.candidats.length} onChange={(event) => state.selectAllCandidates(event.target.checked)} /></th><th>Classe</th><th>Fiche</th><th>Segment / distance</th><th>Pourquoi</th><th>Score</th></tr></thead>
            <tbody>{snapshot.scoring.candidats.map((candidate) => <tr key={candidate.id_prospect} className={state.selectedProspectIds.includes(candidate.id_prospect) ? 'vigieView__candidate--selected' : undefined}>
              <td className="vigieView__check-cell"><input type="checkbox" aria-label={`Sélectionner ${candidate.raison_sociale}`} checked={state.selectedProspectIds.includes(candidate.id_prospect)} onChange={() => state.toggleCandidate(candidate.id_prospect)} /></td>
              <td><span className={`vigieView__score-badge vigieView__score-badge--${candidate.classe.toLowerCase()}`}>{candidate.classe}</span></td><td><strong>{candidate.raison_sociale}</strong><small>{candidate.telephone_contact || candidate.telephone}</small></td><td>{candidate.segment}<small>{formatVigieDistance(candidate.distance_km)} du client campagne</small></td><td>{candidate.raisons.join(' · ')}</td><td><b>{candidate.score}</b><small>+{candidate.score_proximite} proximité · {candidate.nb_tentatives} tentative(s)</small></td>
            </tr>)}</tbody>
          </table></div>
        </div>
      )}
    </section>
  );
}
