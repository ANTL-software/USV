import type { ReactElement } from 'react';

import type { SupervisionViewModel } from '../../../hooks/index.ts';

interface SupervisionCallsProps {
  viewModel: SupervisionViewModel;
}

export function SupervisionCalls({ viewModel }: SupervisionCallsProps): ReactElement {
  const { callRows, handleStartWhisper, whisper } = viewModel;
  const isWhisperActive = whisper.isConnecting || whisper.isConnected;

  return (
    <section>
      <div className="supervisionView__section-header"><h3>Appels en cours ({callRows.length})</h3></div>
      <div className="supervisionView__calls">
        {callRows.length === 0 ? (
          <p className="empty">Aucun appel en cours</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Prospect</th>
                <th>Téléphone</th>
                <th>Origine</th>
                <th>Qualification</th>
                <th>Fin système</th>
                <th>Bridge agent</th>
                <th>Durée</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {callRows.map((call) => {
                const isCurrentWhisper = whisper.activeAppelId === call.id;
                return (
                  <tr key={call.id}>
                    <td>{call.agentName}</td>
                    <td>{call.prospectName}</td>
                    <td>{call.telephone}</td>
                    <td>
                      <span className="origin-badge" style={{ backgroundColor: call.originColor }}>
                        {call.originLabel}
                      </span>
                    </td>
                    <td>
                      <span className="origin-badge" style={{ backgroundColor: call.classificationColor }}>
                        {call.classificationLabel}
                      </span>
                    </td>
                    <td>
                      {call.systemEndLabel === 'Non'
                        ? 'Non'
                        : <span className="system-end-badge">{call.systemEndLabel}</span>}
                    </td>
                    <td className="calls-duration">{call.bridgeLabel}</td>
                    <td className="calls-duration">{call.durationLabel}</td>
                    <td>
                      {call.whisperAvailability === 'unavailable' && (
                        <span className="no-whisper-badge" title="Identifiant d'appel Twilio non disponible">
                          Non connectable
                        </span>
                      )}
                      {call.whisperAvailability === 'pending' && (
                        <button className="whisper-btn pending" disabled title="En attente que le prospect décroche" type="button">
                          ⏳ En attente décroché
                        </button>
                      )}
                      {call.whisperAvailability === 'available' && (
                        <button
                          className={`whisper-btn ${isCurrentWhisper ? 'active' : ''}`}
                          onClick={() => handleStartWhisper(call.id, call.agentName)}
                          disabled={isWhisperActive && !isCurrentWhisper}
                          type="button"
                        >
                          {isCurrentWhisper ? '🎧 En coaching' : '🎙️ Souffler'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
