import type { ReactElement } from 'react';
import type { EmployeStats } from '../../../utils/types/index.ts';
import {
  formatPrimeAmount,
  formatPrimeBonus,
  formatPrimeObjective,
  formatPrimeProduction,
  sortPrimeThresholds,
} from '../../../utils/scripts/index.ts';
import './agentPrimeGauge.scss';

interface AgentPrimeGaugeProps {
  stats: EmployeStats;
}

export function AgentPrimeGauge({ stats }: AgentPrimeGaugeProps): ReactElement | null {
  const { prime } = stats;
  if (!prime) return null;

  const percentage = Math.min(prime.pourcentage_atteint, 100);
  const thresholds = sortPrimeThresholds(prime.paliers);
  const isSalesCampaign = prime.type_campagne === 'vente';

  return (
    <div className="agentPrimeGauge">
      <div className="agentPrimeGauge__header">
        <div className="agentPrimeGauge__headerLeft">
          <span className="agentPrimeGauge__level">{prime.libelle}</span>
          <span className="agentPrimeGauge__monthlyStats">
            {formatPrimeProduction(prime, stats.ventes_mois_count)}
            {isSalesCampaign && (
              <span className="agentPrimeGauge__pendingStats" title="Ventes en attente de validation ce mois-ci">
                {' '}({stats.ventes_mois_en_attente_count} en attente · {formatPrimeAmount(stats.ventes_mois_en_attente_montant)})
              </span>
            )}
          </span>
        </div>
        <div className="agentPrimeGauge__headerRight">
          <span className={prime.prime_debloquee > 0 ? 'agentPrimeGauge__bonus agentPrimeGauge__bonus--active' : 'agentPrimeGauge__bonus agentPrimeGauge__bonus--none'}>
            Prime débloquée : {formatPrimeAmount(prime.prime_debloquee)}
          </span>
          <span className="agentPrimeGauge__objective">
            Objectif 100 % : {formatPrimeObjective(prime.objectif, prime.unite_objectif)}
          </span>
        </div>
      </div>

      <div className="agentPrimeGauge__trackWrapper">
        <div className="agentPrimeGauge__track">
          <div className="agentPrimeGauge__fill" style={{ width: `${percentage}%` }} />
          {thresholds.map((threshold) => (
            <div
              key={threshold.seuil_pourcentage}
              className={`agentPrimeGauge__marker ${threshold.debloque ? 'agentPrimeGauge__marker--unlocked' : ''}`}
              style={{ left: `${threshold.seuil_pourcentage}%` }}
            >
              <div className="agentPrimeGauge__markerLine" />
            </div>
          ))}
        </div>

        <div className="agentPrimeGauge__labels">
          {thresholds.map((threshold) => (
            <div
              key={threshold.seuil_pourcentage}
              className={`agentPrimeGauge__label ${threshold.debloque ? 'agentPrimeGauge__label--unlocked' : ''}`}
              style={{ left: `${threshold.seuil_pourcentage}%` }}
            >
              <span className="agentPrimeGauge__labelPercentage">{threshold.seuil_pourcentage}%</span>
              <span className="agentPrimeGauge__labelObjective">
                {formatPrimeObjective(threshold.objectif_palier, prime.unite_objectif)}
              </span>
              <span className="agentPrimeGauge__labelBonus">{formatPrimeBonus(threshold, prime.salaire_fixe)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="agentPrimeGauge__progressText">
        <span>{formatPrimeObjective(prime.valeur_realisee, prime.unite_objectif)}</span>
        <span className="agentPrimeGauge__percentageValue">{prime.pourcentage_atteint.toFixed(1)}%</span>
        <span>{formatPrimeObjective(prime.objectif, prime.unite_objectif)}</span>
      </div>
    </div>
  );
}
