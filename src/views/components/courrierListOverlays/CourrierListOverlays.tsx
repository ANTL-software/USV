import type { ReactElement } from 'react';
import { MdKeyboardArrowUp, MdNavigateBefore, MdNavigateNext } from 'react-icons/md';

import type { ListeCourriersViewModel } from '../../../hooks/index.ts';
import { DocumentViewerModal, EmailModal } from '../index.ts';

interface CourrierListOverlaysProps {
  viewModel: ListeCourriersViewModel;
}

export function CourrierListOverlays({ viewModel }: CourrierListOverlaysProps): ReactElement {
  const {
    courrierActions,
    currentPage,
    pagination,
    scrollToTop,
    searchTerm,
    setCurrentPage,
    showBackToTop,
    tooltip,
  } = viewModel;
  const { pdfModal } = courrierActions;

  return (
    <>
      {!searchTerm.trim() && pagination && pagination.totalPages > 1 && (
        <div className="mobilePagination mobileOnly">
          <div className="paginationControls">
            <button
              className="paginationBtn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              type="button"
            >
              <MdNavigateBefore />
              Précédent
            </button>
            <div className="paginationInfo">
              <span>Page {currentPage} sur {pagination.totalPages}</span>
              <span className="totalItems">{pagination.total} courrier{pagination.total > 1 ? 's' : ''}</span>
            </div>
            <button
              className="paginationBtn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              type="button"
            >
              Suivant
              <MdNavigateNext />
            </button>
          </div>
        </div>
      )}

      {tooltip.visible && (
        <div className="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.content}
        </div>
      )}

      <DocumentViewerModal
        fileName={pdfModal.fileName}
        fileType={pdfModal.fileType}
        fileUrl={pdfModal.pdfUrl}
        isVisible={pdfModal.visible}
        onClose={courrierActions.closePdfModal}
      />

      <EmailModal viewModel={courrierActions.emailComposer} />

      <EmailModal viewModel={courrierActions.bulkEmailComposer} />

      {showBackToTop && (
        <button
          className="backToTopBtn mobileOnly"
          onClick={scrollToTop}
          title="Retour en haut"
          type="button"
        >
          <MdKeyboardArrowUp />
        </button>
      )}
    </>
  );
}
