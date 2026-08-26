import { useEffect } from 'react';
import type { ReactElement } from 'react';
import { IoEyeOutline, IoFlagOutline, IoRefreshOutline } from 'react-icons/io5';
import Select from 'react-select';
import type { StylesConfig } from 'react-select';
import type { VigieViewState } from '../../../hooks/index.ts';
import {
  formatVigieDate,
  formatVigieNumber,
  formatVigiePercent,
  formatVigiePerThousand,
  type SelectOption,
} from '../../../utils/scripts/index.ts';
import { reactSelectStyles } from '../../../utils/styles/index.ts';
import './homeVigieAside.scss';

interface HomeVigieAsideProps {
  vigieState: VigieViewState;
  onNavigate: (path: string) => void;
}

export function HomeVigieAside({ vigieState, onNavigate }: HomeVigieAsideProps): ReactElement {
  const {
    campaignOptions,
    campagnesLoading,
    error,
    isLoading,
    period,
    refresh,
    selectCampaign,
    selectedCampaignId,
    setPeriod,
    snapshot,
  } = vigieState;

  // Forcer la période "Aujourd'hui" sur la page d'accueil
  useEffect(() => {
    if (period !== 'today') {
      setPeriod('today');
    }
  }, [period, setPeriod]);

  // Sélection automatique de la première campagne active si aucune n'est sélectionnée
  useEffect(() => {
    if (!selectedCampaignId && campaignOptions.length > 0) {
      selectCampaign(campaignOptions[0].value);
    }
  }, [campaignOptions, selectCampaign, selectedCampaignId]);

  const progress = Math.min(snapshot?.objectif.taux_atteinte || 0, 100);

  return (
    <aside id="homeVigieAside" aria-label="Piloter la file en temps réel">
      <div className="homeVigie__header">
        <span className="homeVigie__eyebrow">
          <IoEyeOutline /> Vigie humaine
        </span>
        <h3>Piloter la file en temps réel</h3>
        <p>Observer la cadence, la qualité des fiches et les résultats métier aujourd’hui.</p>
      </div>

      <div className="homeVigie__filters">
        <div className="homeVigie__filter-group">
          <label htmlFor="home-vigie-campaign">Campagne active</label>
          <Select<SelectOption<number>, false>
            inputId="home-vigie-campaign"
            options={campaignOptions}
            value={campaignOptions.find(({ value }) => value === selectedCampaignId) || null}
            onChange={(option) => selectCampaign(option?.value ?? null)}
            styles={reactSelectStyles as StylesConfig<SelectOption<number>, false>}
            placeholder={campagnesLoading ? 'Chargement...' : 'Choisir une campagne...'}
            isLoading={campagnesLoading || isLoading}
            isDisabled={campagnesLoading}
            isClearable
          />
        </div>
      </div>

      {error ? (
        <div className="homeVigie__empty homeVigie__empty--error">
          <p>{error}</p>
          <button
            type="button"
            className="homeVigie__retry-btn"
            onClick={() => { void refresh(); }}
          >
            <IoRefreshOutline /> Réessayer
          </button>
        </div>
      ) : snapshot ? (
        <>
          <div className="homeVigie__campaign-info">
            <div className="homeVigie__campaign-meta">
              <strong>{snapshot.campagne.nom_campagne}</strong>
              <span>
                {formatVigieDate(snapshot.periode.date_debut)} · actualisé à{' '}
                {new Date(snapshot.meta.donnees_actualisees_at).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <button
              type="button"
              onClick={() => { void refresh(); }}
              disabled={isLoading}
              title="Actualiser les indicateurs"
            >
              <IoRefreshOutline /> Actualiser
            </button>
          </div>

          <section className="homeVigie__objective" aria-label="Objectif d'appels du jour">
            <div className="homeVigie__objective-header">
              <span>
                <IoFlagOutline /> Objectif du jour
              </span>
              <b>{formatVigiePercent(snapshot.objectif.taux_atteinte)}</b>
            </div>
            <div className="homeVigie__objective-copy">
              <strong>
                {formatVigieNumber(snapshot.objectif.appels_aujourdhui)} / {formatVigieNumber(snapshot.objectif.objectif_jour)} appels
              </strong>
              <small>
                {snapshot.objectif.agents_ayant_appele} commercial(aux) actif(s) · {snapshot.objectif.appels_par_agent} appels / agent
              </small>
            </div>
            <div
              className="homeVigie__progress"
              aria-label={`Objectif atteint à ${snapshot.objectif.taux_atteinte || 0}%`}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
          </section>

          <section className="homeVigie__kpis-grid" aria-label="Indicateurs opérationnels">
            <article>
              <span>Appels</span>
              <strong>{formatVigieNumber(snapshot.summary.appels)}</strong>
              <small>{formatVigieNumber(snapshot.summary.prospects_appeles)} prospects</small>
            </article>
            <article>
              <span>Décrochés</span>
              <strong>{formatVigiePercent(snapshot.summary.taux_decroche)}</strong>
              <small>{formatVigieNumber(snapshot.summary.decroches)} décrochés</small>
            </article>
            <article>
              <span>Contacts</span>
              <strong>{formatVigiePercent(snapshot.summary.taux_contact_humain)}</strong>
              <small>{formatVigieNumber(snapshot.summary.contacts_humains)} conv.</small>
            </article>
            <article className="homeVigie__kpi--result">
              <span>{snapshot.resultat_metier.libelle_pluriel}</span>
              <strong>{formatVigieNumber(snapshot.resultat_metier.total)}</strong>
              <small>{formatVigiePerThousand(snapshot.resultat_metier.pour_1000_appels)} / 1k</small>
            </article>
            <article>
              <span>Fiches prêtes</span>
              <strong>{formatVigieNumber(snapshot.summary.fiches_pretes)}</strong>
              <small>
                {snapshot.summary.jours_couverture_file === null
                  ? 'n/a'
                  : `≈ ${snapshot.summary.jours_couverture_file}j couv.`}
              </small>
            </article>
            <article>
              <span>Rappels</span>
              <strong>{formatVigieNumber(snapshot.summary.rappels_reserves)}</strong>
              <small>réservés</small>
            </article>
          </section>
        </>
      ) : (
        <div className="homeVigie__empty">
          {isLoading ? 'Chargement des données...' : 'Choisir une campagne.'}
        </div>
      )}

      <div className="homeVigie__footer">
        <button type="button" onClick={() => onNavigate('/operations/vigie')}>
          Ouvrir la vigie complète →
        </button>
      </div>
    </aside>
  );
}
