import type { ReactElement } from 'react';
import { MdOutlineCloudDone, MdRefresh } from 'react-icons/md';
import type { SocialPublicationState } from '../../../hooks/index.ts';
import { Button } from '../index.ts';
import { formatSocialDate } from './socialPublication.constants.ts';

export function SocialStatusOverview({ state }: { state: SocialPublicationState }): ReactElement {
  const status = state.status;
  const platforms = Object.entries(status?.platforms ?? state.platforms);

  return (
    <section className="socialPublicationView__panel socialPublicationView__overview">
      <div className="socialPublicationView__panel-header socialPublicationView__panel-header--actions">
        <div className="socialPublicationView__heading-copy">
          <MdOutlineCloudDone />
          <div>
            <span className="socialPublicationView__section-kicker">Système</span>
            <h2>État des connexions</h2>
            <p>
              {status
                ? `${status.summary.readyPlatforms}/${status.summary.totalPlatforms} connexions prêtes · contrôlé le ${formatSocialDate(status.checkedAt)}`
                : 'Vérification des services en cours…'}
            </p>
          </div>
        </div>
        <Button style="white" onClick={() => void state.refresh()} disabled={state.isLoading}>
          <MdRefresh />
          {state.isLoading ? 'Actualisation…' : 'Actualiser'}
        </Button>
      </div>
      {state.error && <p className="socialPublicationView__feedback socialPublicationView__feedback--error">{state.error}</p>}
      <div className="socialPublicationView__status" aria-label="État des connexions">
        {platforms.map(([key, item]) => (
          <article key={key} className={`socialPublicationView__status-card socialPublicationView__status-card--${item.state}`}>
            <div className="socialPublicationView__status-title">
              <span>{item.label}</span>
              <span className="socialPublicationView__status-dot" aria-hidden="true" />
            </div>
            <strong>
              {item.state === 'ready' ? 'Connexion prête' : item.state === 'disabled' ? 'Désactivé' : 'Configuration requise'}
            </strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
