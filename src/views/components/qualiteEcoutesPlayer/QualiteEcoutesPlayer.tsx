import type { ReactElement } from 'react';
import type { Enregistrement } from '../../../utils/types/index.ts';
import { getRecordingAgentLabel, getRecordingPhone, getRecordingProspectLabel } from '../../../utils/scripts/index.ts';

interface QualiteEcoutesPlayerProps {
  getRecordingUrl: (recordingId: number) => string;
  onClose: () => void;
  recording: Enregistrement;
}

export function QualiteEcoutesPlayer({ getRecordingUrl, onClose, recording }: QualiteEcoutesPlayerProps): ReactElement {
  return (
    <div className="qualiteEcoutes__player-bar animate-slide-up">
      <div className="qualiteEcoutes__player-info">
        <h3>Écoute en cours</h3>
        <p><strong>Agent :</strong> {getRecordingAgentLabel(recording)} | <strong>Appel :</strong> {getRecordingPhone(recording)} | <strong>Raison sociale :</strong> {getRecordingProspectLabel(recording)}</p>
      </div>
      <div className="qualiteEcoutes__player-wrapper"><audio src={getRecordingUrl(recording.id_enregistrement)} controls autoPlay controlsList="nodownload" /></div>
      <button type="button" className="qualiteEcoutes__player-close" onClick={onClose}>Fermer</button>
    </div>
  );
}
