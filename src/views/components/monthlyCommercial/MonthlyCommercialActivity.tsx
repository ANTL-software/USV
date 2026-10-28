import type { CSSProperties } from 'react';
import Select from 'react-select';
import { createReactSelectStyles } from '../../../utils/styles/index.ts';
import type { MonthlyCommercialViewModel } from '../../../hooks/index.ts';
import { QUALITE_FOLLOWUP_COLOR, formatQualitePercent, formatQualiteProgpa, getQualiteStepColor } from '../../../utils/scripts/index.ts';

const campaignStyles = createReactSelectStyles<{ value: string; label: string }, false>();

export function MonthlyCommercialActivity({ viewModel }: { viewModel: MonthlyCommercialViewModel }) {
  const { selectedStatsCampaignId, setSelectedStatsCampaignId, statsCampaignOptions, selectedProgpaStats, selectedCampaignLabel, isPrimeStatsLoading, primeStatsError, periodLabel } = viewModel;
  return <>
              <div className="monthlyCommercial__stats-campaign-filter">
                <label htmlFor="stats-campaign-filter">Campagne affichée</label>
                <Select
                  styles={campaignStyles}
                  inputId="stats-campaign-filter"
                  options={statsCampaignOptions}
                  value={statsCampaignOptions.find((campaign) => campaign.value === selectedStatsCampaignId) ?? null}
                  onChange={(option) => setSelectedStatsCampaignId(option?.value ?? 'all')}
                  isDisabled={isPrimeStatsLoading || !!primeStatsError}
                  isClearable={false}
                  classNamePrefix="reactSelect"
                />
              </div>

              <fieldset className="monthlyCommercial__fieldset">
                <legend>Volume d’appels & ProgPA — {periodLabel}</legend>
                <p className="monthlyCommercial__fieldset-hint">
                  Activité et progression du commercial sur {periodLabel}, pour la campagne affichée.
                </p>
                {isPrimeStatsLoading && (
                  <div className="monthlyCommercial__prime-state">Chargement des statistiques...</div>
                )}
                {!isPrimeStatsLoading && primeStatsError && (
                  <div className="monthlyCommercial__prime-state monthlyCommercial__prime-state--error">{primeStatsError}</div>
                )}
                {!isPrimeStatsLoading && !primeStatsError && selectedProgpaStats && (
                  <>
                    <div className="monthlyCommercial__progpa-kpis">
                      <article className="monthlyCommercial__progpa-kpi-card">
                        <span>Volume d’appels</span>
                        <strong>{selectedProgpaStats.synthese.total_appels}</strong>
                        <small>Appels finalisés : prospection et suivi</small>
                      </article>
                      <article className="monthlyCommercial__progpa-kpi-card">
                        <span>Fiches traitées</span>
                        <strong>{selectedProgpaStats.synthese.prospects_uniques}</strong>
                        <small>Prospects uniques sur la campagne affichée</small>
                      </article>
                      <article className="monthlyCommercial__progpa-kpi-card">
                        <span>ProgPA moyen</span>
                        <strong>{formatQualiteProgpa(selectedProgpaStats.synthese.moyenne_progpa)}</strong>
                        <small>Prospection uniquement, hors appels de suivi</small>
                      </article>
                    </div>

                    <section className="monthlyCommercial__progpa-steps-card">
                      <div className="monthlyCommercial__progpa-section-heading">
                        <div>
                          <h2>Toutes les étapes</h2>
                          <p>Le nombre correspond au niveau exact enregistré au closing.</p>
                        </div>
                        <span>{selectedCampaignLabel}</span>
                      </div>
                      <div className="monthlyCommercial__progpa-steps-grid">
                        {selectedProgpaStats.etapes.map((step) => (
                          <article
                            key={step.progpa}
                            className="monthlyCommercial__progpa-step"
                            style={{ '--step-color': getQualiteStepColor(step.progpa) } as CSSProperties}
                          >
                            <span className="monthlyCommercial__progpa-step-index">{step.progpa}</span>
                            <div>
                              <strong>{step.nombre}</strong>
                              <span>{step.label}</span>
                              <small>{formatQualitePercent(step.pourcentage)}</small>
                            </div>
                          </article>
                        ))}
                        <article
                          className="monthlyCommercial__progpa-step monthlyCommercial__progpa-step--followup"
                          style={{ '--step-color': QUALITE_FOLLOWUP_COLOR } as CSSProperties}
                        >
                          <span className="monthlyCommercial__progpa-step-index">5+</span>
                          <div>
                            <strong>{selectedProgpaStats.suivi_en_cours.nombre}</strong>
                            <span>{selectedProgpaStats.suivi_en_cours.label}</span>
                            <small>{formatQualitePercent(selectedProgpaStats.suivi_en_cours.pourcentage)}</small>
                          </div>
                        </article>
                      </div>
                    </section>
                  </>
                )}
                {!isPrimeStatsLoading && !primeStatsError && !selectedProgpaStats && (
                  <div className="monthlyCommercial__prime-state">
                    Aucune donnée de statistiques disponible pour le mois en cours.
                  </div>
                )}
              </fieldset>

  </>;
}
