import type { ReactElement } from 'react';
import { FiEye } from 'react-icons/fi';
import type { UpdateCourrierViewModel } from '../../../hooks/index.ts';
import { PdfViewer } from '../index.ts';

type CourrierUpdatePreviewProps = Pick<
  UpdateCourrierViewModel,
  'courrier' | 'fileType' | 'pdfUrl'
>;

export function CourrierUpdatePreview({ courrier, fileType, pdfUrl }: CourrierUpdatePreviewProps): ReactElement {
  return (
    <aside className="previewSection">
      <div className="previewHeader"><FiEye /><h2>Aperçu du document</h2></div>
      <div className="previewContainer">
        {pdfUrl && (fileType === 'image' ? (
          <img src={pdfUrl} alt={courrier?.fileName || 'Aperçu du courrier'} className="imagePreview" />
        ) : (
          <PdfViewer pdfUrl={pdfUrl} fileName={courrier?.fileName || 'document.pdf'} />
        ))}
      </div>
    </aside>
  );
}
