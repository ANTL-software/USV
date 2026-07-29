import { useState } from 'react';
import type { ReactElement } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

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

const SecurePDFRenderer = ({ pdfUrl, fileName }: SecurePDFRendererProps): ReactElement => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState('');

  const handleDocumentLoad = ({ numPages: loadedPages }: LoadedPdf): void => {
    setNumPages(loadedPages);
    setPageNumber(1);
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
      <div className="pdf-controls">
        <button
          type="button"
          className="pdf-nav-btn"
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
        >
          Précédente
        </button>
        <span className="pdf-page-info">
          Page {pageNumber} / {numPages || '…'}
        </span>
        <button
          type="button"
          className="pdf-nav-btn"
          disabled={numPages === 0 || pageNumber >= numPages}
          onClick={() => setPageNumber((current) => Math.min(numPages, current + 1))}
        >
          Suivante
        </button>
        <button
          type="button"
          className="pdf-nav-btn"
          disabled={scale <= 0.75}
          onClick={() => setScale((current) => Math.max(0.75, current - 0.25))}
        >
          −
        </button>
        <button
          type="button"
          className="pdf-nav-btn"
          disabled={scale >= 2}
          onClick={() => setScale((current) => Math.min(2, current + 0.25))}
        >
          +
        </button>
      </div>

      <div className="pdf-document-container">
        <Document
          file={pdfUrl}
          loading={<div className="pdf-viewer-loading"><p>Chargement du PDF...</p></div>}
          error=""
          options={PDF_OPTIONS}
          onLoadSuccess={handleDocumentLoad}
          onLoadError={() => setError('Impossible de charger le PDF')}
        >
          <Page
            className="pdf-page"
            pageNumber={pageNumber}
            scale={scale}
          />
        </Document>
      </div>

      <div className="pdf-actions">
        <a
          className="pdf-download-link"
          href={pdfUrl}
          download={fileName}
          target="_blank"
          rel="noreferrer"
        >
          Télécharger le document
        </a>
      </div>
    </div>
  );
};

export default SecurePDFRenderer;
