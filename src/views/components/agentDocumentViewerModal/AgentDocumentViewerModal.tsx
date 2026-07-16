import type { ReactElement } from 'react';
import type { EmployeeDetailsViewModel } from '../../../hooks/index.ts';
import { Modal, PdfViewer } from '../index.ts';

type AgentDocumentViewerModalProps = Pick<
  EmployeeDetailsViewModel,
  'closePdfModal' | 'pdfModal'
>;

export function AgentDocumentViewerModal({
  closePdfModal,
  pdfModal,
}: AgentDocumentViewerModalProps): ReactElement {
  return (
    <Modal
      isVisible={pdfModal.visible}
      onClose={closePdfModal}
      title={pdfModal.fileName || `Visualisation ${pdfModal.fileType.toUpperCase()}`}
    >
      {pdfModal.fileType === 'image' ? (
        <img src={pdfModal.pdfUrl} alt={pdfModal.fileName} className="modal-content-image" />
      ) : (
        <div id="pdfViewerDocument">
          <PdfViewer pdfUrl={pdfModal.pdfUrl} fileName={pdfModal.fileName || 'document.pdf'} />
        </div>
      )}
    </Modal>
  );
}
