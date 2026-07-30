import { useState } from 'react';
import type { ReactElement } from 'react';

import { DocumentViewerToolbar } from '../documentViewerToolbar/index.ts';

import './documentViewerModal.scss';

interface DocumentImageViewerProps {
  fileName: string;
  imageUrl: string;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const SCALE_STEP = 0.25;

export function DocumentImageViewer({
  fileName,
  imageUrl,
}: DocumentImageViewerProps): ReactElement {
  const [scale, setScale] = useState(1);

  return (
    <div id="documentImageViewer">
      <DocumentViewerToolbar
        canZoomIn={scale < MAX_SCALE}
        canZoomOut={scale > MIN_SCALE}
        downloadUrl={imageUrl}
        fileName={fileName}
        onZoomIn={() => setScale((current) => Math.min(MAX_SCALE, current + SCALE_STEP))}
        onZoomOut={() => setScale((current) => Math.max(MIN_SCALE, current - SCALE_STEP))}
        scale={scale}
        statusLabel="Image"
      />

      <div className="documentImageViewer__viewport">
        <div
          className="documentImageViewer__canvas"
          style={{ width: `${scale * 100}%` }}
        >
          <img
            alt={fileName}
            className="documentImageViewer__image"
            src={imageUrl}
          />
        </div>
      </div>
    </div>
  );
}
