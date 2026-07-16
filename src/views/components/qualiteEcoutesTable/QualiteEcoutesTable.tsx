import type { ReactElement } from 'react';
import { MdDownload, MdPause, MdPlayArrow } from 'react-icons/md';
import type { QualiteEcoutesPageViewModel } from '../../../hooks/index.ts';
import {
  formatFileSize,
  formatRecordingDate,
  formatRecordingDuration,
  getRecordingAgentLabel,
  getRecordingPhone,
  getRecordingProspectLabel,
  getRecordingStatusClass,
  getRecordingStatusLabel,
} from '../../../utils/scripts/index.ts';

interface QualiteEcoutesTableProps { viewModel: QualiteEcoutesPageViewModel }

export function QualiteEcoutesTable({ viewModel }: QualiteEcoutesTableProps): ReactElement {
  if (viewModel.isLoading) return <div className="qualiteEcoutes__loading">Chargement des enregistrements...</div>;
  if (viewModel.recordings.length === 0) return <div className="qualiteEcoutes__empty">Aucun enregistrement d’appel trouvé pour ces critères.</div>;

  return (
    <div className="qualiteEcoutes__table-wrap animate-fade-in">
      <table className="qualiteEcoutes__table">
        <thead><tr><th>Date / Heure</th><th>Agent</th><th>Campagne</th><th>Prospect / Raison Sociale</th><th>Téléphone</th><th>Durée</th><th>Statut</th><th>Fichier</th><th>Actions</th></tr></thead>
        <tbody>
          {viewModel.recordings.map((recording) => {
            const isPlaying = viewModel.activeRecording?.id_enregistrement === recording.id_enregistrement;
            return (
              <tr key={recording.id_enregistrement} className={isPlaying ? 'qualiteEcoutes__row--playing' : ''}>
                <td><strong>{formatRecordingDate(recording.created_at)}</strong></td>
                <td>{getRecordingAgentLabel(recording)}</td>
                <td><span className="qualiteEcoutes__badge-campagne">{recording.appel?.campagne?.nom_campagne || '—'}</span></td>
                <td className={getRecordingProspectLabel(recording) === 'Particulier' ? 'qualiteEcoutes__text-muted' : ''}>{getRecordingProspectLabel(recording)}</td>
                <td>{getRecordingPhone(recording)}</td>
                <td>{formatRecordingDuration(recording.duree_secondes)}</td>
                <td><span className={getRecordingStatusClass(recording)}>{getRecordingStatusLabel(recording)}</span></td>
                <td><span className="qualiteEcoutes__file-info">{formatFileSize(recording.taille_octets)}</span></td>
                <td className="qualiteEcoutes__actions">
                  <button type="button" className={`qualiteEcoutes__btn-play ${isPlaying ? 'qualiteEcoutes__btn-play--active' : ''}`} onClick={() => viewModel.setActiveRecording(recording)} title={isPlaying ? 'Lecture en cours' : 'Écouter l’appel'}>{isPlaying ? <MdPause /> : <MdPlayArrow />}</button>
                  <a href={viewModel.getRecordingUrl(recording.id_enregistrement)} download={recording.nom_fichier} className="qualiteEcoutes__btn-download" title="Télécharger l’enregistrement" target="_blank" rel="noopener noreferrer"><MdDownload /></a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {viewModel.totalPages > 1 && (
        <div className="qualiteEcoutes__pagination">
          <button type="button" disabled={viewModel.page === 1} onClick={viewModel.previousPage}>Précédent</button>
          <span className="qualiteEcoutes__page-info">Page <strong>{viewModel.page}</strong> sur <strong>{viewModel.totalPages}</strong></span>
          <button type="button" disabled={viewModel.page === viewModel.totalPages} onClick={viewModel.nextPage}>Suivant</button>
        </div>
      )}
    </div>
  );
}
