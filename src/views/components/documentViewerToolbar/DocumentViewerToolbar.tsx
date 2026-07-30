import type { ReactElement } from 'react';
import { FiDownload, FiZoomIn, FiZoomOut } from 'react-icons/fi';

import './documentViewerToolbar.scss';

interface DocumentViewerToolbarProps {
  canZoomIn: boolean;
  canZoomOut: boolean;
  downloadUrl: string;
  fileName: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  scale: number;
  statusLabel: string;
}

export function DocumentViewerToolbar({
  canZoomIn,
  canZoomOut,
  downloadUrl,
  fileName,
  onZoomIn,
  onZoomOut,
  scale,
  statusLabel,
}: DocumentViewerToolbarProps): ReactElement {
  return (
    <div
      aria-label="Outils du document"
      className="documentViewerToolbar"
      id="documentViewerToolbar"
      role="toolbar"
    >
      <span className="documentViewerToolbar__status">{statusLabel}</span>

      <div className="documentViewerToolbar__actions">
        <div className="documentViewerToolbar__zoom" aria-label="Contrôles de zoom">
          <button
            aria-label="Zoom arrière"
            className="documentViewerToolbar__iconButton"
            disabled={!canZoomOut}
            onClick={onZoomOut}
            title="Zoom arrière"
            type="button"
          >
            <FiZoomOut aria-hidden="true" />
          </button>
          <output
            aria-label="Niveau de zoom"
            className="documentViewerToolbar__scale"
          >
            {Math.round(scale * 100)} %
          </output>
          <button
            aria-label="Zoom avant"
            className="documentViewerToolbar__iconButton"
            disabled={!canZoomIn}
            onClick={onZoomIn}
            title="Zoom avant"
            type="button"
          >
            <FiZoomIn aria-hidden="true" />
          </button>
        </div>

        <a
          className="documentViewerToolbar__download"
          download={fileName}
          href={downloadUrl}
          rel="noreferrer"
          target="_blank"
          title="Télécharger le document"
        >
          <FiDownload aria-hidden="true" />
          <span>Télécharger</span>
        </a>
      </div>
    </div>
  );
}
