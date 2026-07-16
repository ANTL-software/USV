import type { MouseEvent, ReactElement } from 'react';
import type { AbsenceManagementViewModel } from '../../../hooks/index.ts';
import { Button } from '../index.ts';

type AbsenceManagementTableProps = Pick<
  AbsenceManagementViewModel,
  | 'activeTab'
  | 'emptyMessage'
  | 'isLoading'
  | 'isUpdating'
  | 'requestViews'
  | 'selectRequest'
  | 'updateStatus'
>;

export function AbsenceManagementTable({
  activeTab,
  emptyMessage,
  isLoading,
  isUpdating,
  requestViews,
  selectRequest,
  updateStatus,
}: AbsenceManagementTableProps): ReactElement {
  if (isLoading) {
    return <div className="absenceDemandes__state">Chargement...</div>;
  }

  if (requestViews.length === 0) {
    return <div className="absenceDemandes__state">{emptyMessage}</div>;
  }

  const stopAndUpdate = (
    event: MouseEvent<HTMLButtonElement>,
    requestId: number,
    status: 'validee' | 'refusee',
  ): void => {
    event.stopPropagation();
    void updateStatus(requestId, status);
  };

  return (
    <div className="absenceDemandes__tableWrapper">
      <table className="absenceDemandes__table">
        <thead>
          <tr>
            <th>Qui</th>
            <th>Période</th>
            <th>Motif</th>
            <th>Date de retour</th>
            {(activeTab === 'pending' || activeTab === 'all') && <th>Statut</th>}
            {activeTab === 'pending' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {requestViews.map((view) => (
            <tr
              key={view.request.id_demande}
              className="absenceDemandes__row"
              onClick={() => selectRequest(view.request)}
            >
              <td>{view.employeeName}</td>
              <td>{view.period}</td>
              <td>
                <div className="absenceDemandes__motif">
                  <strong>{view.request.motif_label}</strong>
                  <span>{view.request.description}</span>
                </div>
              </td>
              <td>{view.returnDate}</td>
              {(activeTab === 'pending' || activeTab === 'all') && (
                <td>
                  <span className={`absenceDemandes__status absenceDemandes__status--${view.request.statut}`}>
                    {view.statusLabel}
                  </span>
                </td>
              )}
              {activeTab === 'pending' && (
                <td>
                  <div className="absenceDemandes__actions">
                    <Button
                      style="green"
                      onClick={(event) => stopAndUpdate(event, view.request.id_demande, 'validee')}
                      disabled={isUpdating === view.request.id_demande}
                    >
                      <span>Valider</span>
                    </Button>
                    <Button
                      style="red"
                      onClick={(event) => stopAndUpdate(event, view.request.id_demande, 'refusee')}
                      disabled={isUpdating === view.request.id_demande}
                    >
                      <span>Refuser</span>
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
