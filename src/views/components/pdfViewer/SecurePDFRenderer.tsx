import { useState } from 'react';
import type { ReactElement } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import { DocumentViewerToolbar } from '../documentViewerToolbar/index.ts';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export interface SecurePDFRendererProps {
  pdfUrl: string;
  fileName: string;
}

interface LoadedPdf {
  numPages: number;
}

const PDF_OPTIONS = { isEvalSupported: false } as const;
const MIN_SCALE = 0.75;
const MAX_SCALE = 2;
const SCALE_STEP = 0.25;

const getInitialScale = (): number => (
  window.matchMedia('(max-width: 768px)').matches ? MIN_SCALE : 1.1
);

const SecurePDFRenderer = ({ pdfUrl, fileName }: SecurePDFRendererProps): ReactElement => {
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(getInitialScale);
  const [error, setError] = useState('');

  const handleDocumentLoad = ({ numPages: loadedPages }: LoadedPdf): void => {
    setNumPages(loadedPages);
    setError('');
  };

  if (error) {
    return (
      <div className="pdf-viewer-error">
        <p>Erreur lors du chargement du PDF</p>
        <button
          type="button"
          onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
          className="pdf-error-button"
        >
          Ouvrir dans un nouvel onglet
        </button>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <DocumentViewerToolbar
        canZoomIn={scale < MAX_SCALE}
        canZoomOut={scale > MIN_SCALE}
        downloadUrl={pdfUrl}
        fileName={fileName}
        onZoomIn={() => setScale((current) => Math.min(MAX_SCALE, current + SCALE_STEP))}
        onZoomOut={() => setScale((current) => Math.max(MIN_SCALE, current - SCALE_STEP))}
        scale={scale}
        statusLabel={
          numPages > 0
            ? `${numPages} page${numPages > 1 ? 's' : ''}`
            : 'Chargement…'
        }
      />

      <div className="pdf-document-container">
        <Document
          file={pdfUrl}
          loading={<div className="pdf-viewer-loading"><p>Chargement du PDF...</p></div>}
          error=""
          options={PDF_OPTIONS}
          onLoadSuccess={handleDocumentLoad}
          onLoadError={() => setError('Impossible de charger le PDF')}
        >
          <div className="pdf-pages">
            {Array.from({ length: numPages }, (_, pageIndex) => {
              const pageNumber = pageIndex + 1;

              return (
                <section
                  aria-label={`Page ${pageNumber} sur ${numPages}`}
                  className="pdf-page-frame"
                  key={pageNumber}
                >
                  <span className="pdf-page-label">
                    Page {pageNumber} / {numPages}
                  </span>
                  <Page
                    className="pdf-page"
                    pageNumber={pageNumber}
                    scale={scale}
                  />
                </section>
              );
            })}
          </div>
        </Document>
      </div>
    </div>
  );
};

export default SecurePDFRenderer;
