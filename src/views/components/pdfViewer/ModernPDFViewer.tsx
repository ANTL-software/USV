import { lazy, Suspense } from 'react';
import type { ReactElement } from 'react';

const SecurePDFRenderer = lazy(() => import('./SecurePDFRenderer.tsx'));

interface ModernPDFViewerProps {
  pdfUrl: string;
  fileName: string;
}

const ModernPDFViewer = ({ pdfUrl, fileName }: ModernPDFViewerProps): ReactElement => (
  <Suspense fallback={<div className="pdf-viewer-loading"><p>Chargement du PDF...</p></div>}>
    <SecurePDFRenderer pdfUrl={pdfUrl} fileName={fileName} />
  </Suspense>
);

export default ModernPDFViewer;
