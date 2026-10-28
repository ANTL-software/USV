import type { MonthlyCommercialViewModel } from '../../../hooks/index.ts';
import { formatPrimeAmount } from '../../../utils/scripts/index.ts';
import { AgentPrimeGauge } from '../index.ts';

export function MonthlyCommercialPrime({ viewModel }: { viewModel: MonthlyCommercialViewModel }) {
  const { primeStats, isPrimeStatsLoading, primeStatsError, periodLabel, selectedCampaignLabel } = viewModel;
  return <>
    {!isPrimeStatsLoading && primeStats?.production_campagne && <fieldset className="monthlyCommercial__fieldset">
      <legend>Production de la campagne — {selectedCampaignLabel}</legend>
      <p>{periodLabel} · La prime reste calculée sur l’ensemble des campagnes du mois.</p>
      <div className="monthlyCommercial__progpa-kpis">
        <article className="monthlyCommercial__progpa-kpi-card"><span>Ventes validées</span><strong>{primeStats.production_campagne.ventes_mois_count}</strong><small>{formatPrimeAmount(primeStats.production_campagne.ventes_mois_montant)}</small></article>
        <article className="monthlyCommercial__progpa-kpi-card"><span>Rendez-vous hors annulations</span><strong>{primeStats.production_campagne.leads_mois_count}</strong><small>{formatPrimeAmount(primeStats.production_campagne.leads_mois_valeur)}</small></article>
        <article className="monthlyCommercial__progpa-kpi-card"><span>Production valorisée</span><strong>{formatPrimeAmount(primeStats.production_campagne.valeur_realisee)}</strong><small>Contribution à la production globale</small></article>
      </div>
    </fieldset>}
              <fieldset className="monthlyCommercial__fieldset">
                <legend>Suivi de la prime</legend>
                <p className="monthlyCommercial__fieldset-hint">
                  Production de {periodLabel}, toutes campagnes confondues, et prime globale du commercial.
                  Calcul selon le niveau, l’objectif et le barème actuellement configurés.
                </p>
                {isPrimeStatsLoading && (
                  <div className="monthlyCommercial__prime-state">Chargement de la jauge...</div>
                )}
                {!isPrimeStatsLoading && primeStatsError && (
                  <div className="monthlyCommercial__prime-state monthlyCommercial__prime-state--error">{primeStatsError}</div>
                )}
                {!isPrimeStatsLoading && !primeStatsError && primeStats?.prime && (
                  <AgentPrimeGauge stats={primeStats} />
                )}
                {!isPrimeStatsLoading && !primeStatsError && !primeStats?.prime && (
                  <div className="monthlyCommercial__prime-state">
                    Aucun niveau de prime configuré pour ce commercial.
                  </div>
                )}
              </fieldset>

  </>;
}
