import type { ReactElement } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { MdDownload, MdPause, MdPlayArrow } from 'react-icons/md';
import type { QualiteEcoutesPageViewModel } from '../../../hooks/index.ts';
import {
  formatFileSize,
  formatRecordingDate,
  formatRecordingDuration,
  getRecordingActivityLabel,
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
        <thead><tr><th>ID Appel</th><th>Date / Heure</th><th>Agent</th><th>Campagne</th><th>Prospect / Raison Sociale</th>{viewModel.showProspectActivity && <th>Secteur d’activité</th>}<th>Téléphone</th><th>Durée</th><th>Statut</th><th>Fichier</th><th>Actions</th></tr></thead>
        <tbody>
          {viewModel.recordings.map((recording) => {
            const isPlaying = viewModel.activeRecording?.id_enregistrement === recording.id_enregistrement;
            const callId = recording.id_appel || recording.appel?.id_appel;
            return (
              <tr key={recording.id_enregistrement} className={isPlaying ? 'qualiteEcoutes__row--playing' : ''}>
                <td><code className="qualiteEcoutes__call-id">{callId ? `#${callId}` : '—'}</code></td>
                <td><strong>{formatRecordingDate(recording.created_at)}</strong></td>
                <td>{getRecordingAgentLabel(recording)}</td>
                <td><span className="qualiteEcoutes__badge-campagne">{recording.appel?.campagne?.nom_campagne || '—'}</span></td>
                <td className={getRecordingProspectLabel(recording) === '—' ? 'qualiteEcoutes__text-muted' : ''}>{getRecordingProspectLabel(recording)}</td>
                {viewModel.showProspectActivity && <td>{getRecordingActivityLabel(recording)}</td>}
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
          <span className="qualiteEcoutes__page-info">Page {viewModel.page} / {viewModel.totalPages}{viewModel.showTotalCount && ` (${viewModel.totalCount} appels)`}</span>
          <div className="qualiteEcoutes__pagination-buttons">
            <button type="button" className="qualiteEcoutes__pagination-btn" disabled={viewModel.page === 1} onClick={viewModel.previousPage} title="Page précédente"><IoChevronBack /></button>
            <span className="qualiteEcoutes__pagination-pages">
              {viewModel.paginationPages.map((paginationPage) => <button key={paginationPage} type="button" className={viewModel.page === paginationPage ? 'active' : ''} onClick={() => viewModel.setPage(paginationPage)}>{paginationPage}</button>)}
            </span>
            <button type="button" className="qualiteEcoutes__pagination-btn" disabled={viewModel.page === viewModel.totalPages} onClick={viewModel.nextPage} title="Page suivante"><IoChevronForward /></button>
          </div>
        </div>
      )}
    </div>
  );
}
