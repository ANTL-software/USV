import type { ReactElement } from 'react';
import { IoCall } from 'react-icons/io5';
import type { LeadClientDetailsPageViewModel } from '../../../hooks/index.ts';
import { formatDateShort, formatDurationFromSeconds, formatTime, getStatutAppelClass, getStatutAppelLabel, resolveCallAgent } from '../../../utils/scripts/index.ts';
import { Loader } from '../index.ts';

type LeadCallsHistoryProps = Pick<LeadClientDetailsPageViewModel, 'appels' | 'appelsError' | 'appelsLoading' | 'appelsPage' | 'appelsTotal' | 'appelsTotalPages' | 'loadAppels'>;

export function LeadCallsHistory(props: LeadCallsHistoryProps): ReactElement {
  return (
    <section className="details-section card-style">
      <h3 className="section-title"><IoCall /> Historique des appels campagne ({props.appelsTotal})</h3>
      {props.appelsLoading && <Loader message="Chargement des appels..." />}
      {props.appelsError && <p className="history-error">{props.appelsError}</p>}
      {!props.appelsLoading && !props.appelsError && props.appels.length === 0 && <p className="history-empty">Aucun appel enregistré pour ce prospect sur cette campagne.</p>}
      {!props.appelsLoading && !props.appelsError && props.appels.length > 0 && (
        <div className="appels-history-list">
          {props.appels.map((appel) => (
            <div key={appel.id_appel} className="appel-history-item">
              <div className="appel-history-header">
                <div className="appel-history-meta"><span className="appel-history-date">{formatDateShort(appel.created_at)}</span><span className="appel-history-time">{formatTime(appel.created_at)}</span></div>
                <span className={`appel-history-status status-badge-${getStatutAppelClass(appel.statut_appel)}`}>{getStatutAppelLabel(appel.statut_appel)}</span>
              </div>
              <div className="appel-history-body">
                <div className="appel-history-details"><span><strong>Durée :</strong> {formatDurationFromSeconds(appel.duree_secondes)}</span><span><strong>Agent :</strong> {resolveCallAgent(appel)}</span></div>
                {appel.notes && <p className="appel-history-notes">{appel.notes}</p>}
              </div>
            </div>
          ))}
          {props.appelsTotalPages > 1 && (
            <div className="appels-history-pagination">
              <button className="pag-btn" onClick={() => void props.loadAppels(props.appelsPage - 1)} disabled={props.appelsPage === 1}>Précédent</button>
              <span className="pag-info">Page {props.appelsPage} sur {props.appelsTotalPages}</span>
              <button className="pag-btn" onClick={() => void props.loadAppels(props.appelsPage + 1)} disabled={props.appelsPage === props.appelsTotalPages}>Suivant</button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
