import type { ReactElement } from 'react';
import type { EmployeeDetailsViewModel } from '../../../hooks/index.ts';
import { DocumentViewerModal } from '../index.ts';

type AgentDocumentViewerModalProps = Pick<
  EmployeeDetailsViewModel,
  'closePdfModal' | 'pdfModal'
>;

export function AgentDocumentViewerModal({
  closePdfModal,
  pdfModal,
}: AgentDocumentViewerModalProps): ReactElement {
  return (
    <DocumentViewerModal
      fileName={pdfModal.fileName}
      fileType={pdfModal.fileType}
      fileUrl={pdfModal.pdfUrl}
      isVisible={pdfModal.visible}
      onClose={closePdfModal}
    />
  );
}
