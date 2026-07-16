import type { ReactElement } from 'react';
import { IoCall } from 'react-icons/io5';
import type { LeadClientDetailsPageViewModel } from '../../../hooks/index.ts';
import { STATUT_RENDEZ_VOUS_LABELS } from '../../../utils/types/index.ts';
import { formatDateShort, formatLeadClientReference, formatLeadDateTime, getLeadStatusBadgeClass } from '../../../utils/scripts/index.ts';
import { Loader } from '../index.ts';

type LeadAppointmentsHistoryProps = Pick<LeadClientDetailsPageViewModel, 'leadHistory' | 'leadHistoryError' | 'leadHistoryLoading'>;

export function LeadAppointmentsHistory({ leadHistory, leadHistoryError, leadHistoryLoading }: LeadAppointmentsHistoryProps): ReactElement {
  return (
    <section className="details-section card-style">
      <h3 className="section-title"><IoCall /> Historique des rendez-vous client ({leadHistory.length})</h3>
      {leadHistoryLoading && <Loader message="Chargement des rendez-vous..." />}
      {leadHistoryError && <p className="history-error">{leadHistoryError}</p>}
      {!leadHistoryLoading && !leadHistoryError && leadHistory.length === 0 && <p className="history-empty">Aucun autre rendez-vous client sur cette campagne pour ce prospect.</p>}
      {!leadHistoryLoading && !leadHistoryError && leadHistory.length > 0 && (
        <div className="ventes-history-list">
          {leadHistory.map((historyItem) => (
            <div key={historyItem.id_lead} className="vente-history-item">
              <div className="vente-history-header">
                <div className="vente-history-info"><span className="vente-history-date">{formatDateShort(historyItem.created_at)}</span><span className="vente-history-ref">{formatLeadClientReference(historyItem.id_lead)}</span><span className="vente-history-amount">{formatLeadDateTime(historyItem.date_rdv, historyItem.heure_rdv)}</span></div>
                <div className="vente-history-actions"><span className={`${getLeadStatusBadgeClass(historyItem.statut)} statut-badge--mini`}>{STATUT_RENDEZ_VOUS_LABELS[historyItem.statut]}</span></div>
              </div>
              <div className="vente-history-details-expanded">
                <p className="vente-history-agent"><strong>Commercial :</strong> {historyItem.agent ? `${historyItem.agent.prenom} ${historyItem.agent.nom.toUpperCase()}` : '—'}</p>
                <p className="vente-history-notes"><strong>Interlocuteur :</strong> {historyItem.interlocuteur_nom ?? '—'}</p>
                {historyItem.notes && <p className="vente-history-notes"><strong>Notes :</strong> {historyItem.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
