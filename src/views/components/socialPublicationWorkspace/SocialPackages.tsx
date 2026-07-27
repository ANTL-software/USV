import type { ReactElement } from 'react';
import { MdInventory2 } from 'react-icons/md';
import type { SocialPublicationStatus } from '../../../utils/types/index.ts';
import { formatSocialDate, platformLabels } from './socialPublication.constants.ts';

export function SocialPackages({ status }: { status: SocialPublicationStatus | null }): ReactElement {
  const packages = status?.packages ?? [];
  const anomalies = status?.summary.anomalies ?? 0;

  return (
    <section className="socialPublicationView__panel">
      <div className="socialPublicationView__panel-header socialPublicationView__panel-header--actions">
        <div className="socialPublicationView__heading-copy">
          <MdInventory2 />
          <div>
            <span className="socialPublicationView__section-kicker">Production</span>
            <h2>Packages préparés</h2>
            <p>Manifestes persistants prêts pour la programmation, indépendants de toute machine locale.</p>
          </div>
        </div>
        <span className="socialPublicationView__summary">
          {packages.length} package{packages.length > 1 ? 's' : ''} · {anomalies} anomalie{anomalies > 1 ? 's' : ''}
        </span>
      </div>
      {packages.length ? (
        <div className="socialPublicationView__table-wrap">
          <table className="socialPublicationView__table">
            <thead>
              <tr>
                <th>Réseau</th>
                <th>Préparé le</th>
                <th>Mehdi</th>
                <th>Visuel</th>
                <th>État</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((item) => (
                <tr key={item.packageId}>
                  <td><strong>{platformLabels[item.platform]}</strong></td>
                  <td>{formatSocialDate(item.preparedAt)}</td>
                  <td><span className={item.approval.mehdi ? 'socialPublicationView__check' : 'socialPublicationView__check socialPublicationView__check--error'}>{item.approval.mehdi ? 'Validé' : 'À valider'}</span></td>
                  <td><span className={item.mediaPresent ? 'socialPublicationView__check' : 'socialPublicationView__check socialPublicationView__check--error'}>{item.mediaPresent ? 'Présent' : 'Absent'}</span></td>
                  <td>{item.anomalies.length ? <span className="socialPublicationView__table-error">{item.anomalies.join(' · ')}</span> : <span className="socialPublicationView__table-ready">{item.published ? 'Publié' : 'Prêt à programmer'}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="socialPublicationView__empty">Aucun package préparé.</p>
      )}
    </section>
  );
}
