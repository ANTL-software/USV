import React from 'react';
import { MdMic, MdMicOff, MdCallEnd } from 'react-icons/md';
import { formatCallDuration } from '../../../utils/scripts/index.ts';
import './whisperPanel.scss';

interface WhisperPanelProps {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  duration: number;
  agentName: string | null;
  error: string | null;
  onMuteToggle: () => void;
  onDisconnect: () => void;
  onCloseError?: () => void;
}

export const WhisperPanel: React.FC<WhisperPanelProps> = ({
  isConnected,
  isConnecting,
  isMuted,
  duration,
  agentName,
  error,
  onMuteToggle,
  onDisconnect,
  onCloseError
}) => {
  if (!isConnecting && !isConnected && !error) return null;

  return (
    <div className={`whisperPanel ${error ? 'whisperPanel--error' : ''}`}>
      <div className="whisperPanel__header">
        <span className={`whisperPanel__badge ${isConnecting ? 'connecting' : isMuted ? 'listening' : 'whispering'}`}>
          {isConnecting ? 'Connexion...' : isMuted ? 'Écoute seule' : 'Micro vers agent actif'}
        </span>
        <div className="whisperPanel__title">
          {agentName || 'Agent'}
        </div>
        {isConnected && (
          <div className="whisperPanel__timer">
            {formatCallDuration(duration)}
          </div>
        )}
      </div>

      {error ? (
        <div className="whisperPanel__body">
          <p className="whisperPanel__error-text">{error}</p>
          <button className="whisperPanel__close-btn" onClick={onCloseError || onDisconnect}>
            Fermer
          </button>
        </div>
      ) : (
        <div className="whisperPanel__actions">
          <button
            className={`whisperPanel__action-btn whisperPanel__action-btn--mute ${isMuted ? 'muted' : 'active'}`}
            onClick={onMuteToggle}
            disabled={!isConnected}
            title={isMuted ? "Activer le micro pour parler au commercial uniquement" : "Couper le micro et revenir en écoute seule"}
          >
            {isMuted ? <MdMicOff size={20} /> : <MdMic size={20} />}
            <span>{isMuted ? "Parler à l'agent" : "Revenir en écoute"}</span>
          </button>
          
          <button
            className="whisperPanel__action-btn whisperPanel__action-btn--hangup"
            onClick={onDisconnect}
            title="Terminer la session"
          >
            <MdCallEnd size={20} />
            <span>Quitter</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default WhisperPanel;
