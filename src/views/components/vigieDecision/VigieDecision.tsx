import type { ReactElement } from 'react';
import { IoAnalyticsOutline, IoBulbOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';

import type { VigieViewState } from '../../../hooks/index.ts';
import { formatVigieCurrency, formatVigieNumber, formatVigiePercent, formatVigiePerThousand } from '../../../utils/scripts/index.ts';

interface VigieDecisionProps {
  state: VigieViewState;
}

export function VigieDecision({ state }: VigieDecisionProps): ReactElement | null {
  const { snapshot } = state;
  if (!snapshot) return null;
  return (
    <div className="vigieView__grid vigieView__grid--decision">
      <section className="vigieView__panel vigieView__panel--assistant">
        <div className="vigieView__panel-title"><IoBulbOutline /><div><h2>Assistant Vigie</h2><p>Recommandations explicables à confirmer par le superviseur.</p></div></div>
        <div className="vigieView__recommendations">
          {snapshot.recommandations.map((recommendation) => {
            const isValidated = state.validatedRecommendationKeys.has(recommendation.key);
            return <article key={recommendation.key} className={`vigieView__recommendation vigieView__recommendation--${recommendation.niveau}`}>
              <div className="vigieView__recommendation-heading"><strong>{recommendation.titre}</strong><span>{recommendation.niveau}</span></div><p>{recommendation.detail}</p><small>{recommendation.preuve}</small>
              <div className="vigieView__recommendation-footer"><span>Aucune action automatique</span><div>
                {recommendation.action_suggeree === 'preparation_injection' && <button className="vigieView__button vigieView__button--ghost" type="button" onClick={() => state.prepareRecommendation(recommendation)}>Reprendre</button>}
                <button className="vigieView__button vigieView__button--primary" type="button" disabled={isValidated || state.pendingAction === `validation_recommandation-${recommendation.key}`} onClick={() => { void state.validateRecommendation(recommendation); }}>{isValidated ? <><IoCheckmarkCircleOutline /> Validé</> : 'Valider le conseil'}</button>
              </div></div>
            </article>;
          })}
        </div>
      </section>
      <section className="vigieView__panel vigieView__business">
        <div className="vigieView__panel-title"><IoAnalyticsOutline /><div><h2>Résultat métier</h2><p>Le signal commercial distinct du simple statut d’appel.</p></div></div>
        <div className="vigieView__business-main"><span>{snapshot.resultat_metier.libelle_pluriel}</span><strong>{formatVigieNumber(snapshot.resultat_metier.total)}</strong><small>{formatVigiePerThousand(snapshot.resultat_metier.pour_1000_appels)} pour 1 000 appels</small></div>
        {snapshot.resultat_metier.valeur_nominale !== null && <div className="vigieView__business-value"><span>Valeur nominale produite</span><strong>{formatVigieCurrency(snapshot.resultat_metier.valeur_nominale)}</strong></div>}
        <dl className="vigieView__business-stats"><div><dt>Reliés à un appel</dt><dd>{formatVigiePercent(snapshot.resultat_metier.taux_liaison_appel)}</dd></div>{snapshot.resultat_metier.taux_validation !== null && <div><dt>Validés ensuite</dt><dd>{formatVigiePercent(snapshot.resultat_metier.taux_validation)}</dd></div>}{snapshot.resultat_metier.taux_envoi_trace !== null && <div><dt>Envoi horodaté</dt><dd>{formatVigiePercent(snapshot.resultat_metier.taux_envoi_trace)}</dd></div>}</dl>
        <div className="vigieView__status-cloud">{snapshot.resultat_metier.statuts.map((status) => <span key={status.statut}>{status.statut.replace(/_/g, ' ')} <b>{status.total}</b></span>)}</div>
        <p className="vigieView__business-rule">{snapshot.resultat_metier.regle_metier}</p>
      </section>
    </div>
  );
}
