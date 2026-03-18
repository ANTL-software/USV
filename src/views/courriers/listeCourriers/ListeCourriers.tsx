// styles
import "./listeCourriers.scss";

// hooks | libraries
import { ReactElement, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdArrowBack, MdDownload, MdEdit, MdDelete, MdEmail, MdSearch,
  MdNavigateNext, MdNavigateBefore, MdVisibility, MdArchive,
  MdOutlineMarkEmailRead, MdSelectAll, MdKeyboardArrowUp,
} from "react-icons/md";
import { FiFileText } from "react-icons/fi";

// components
import WithAuth from "../../../utils/middleware/WithAuth.tsx";
import Header from "../../../components/header/Header.tsx";
import SubNav from "../../../components/subNav/SubNav.tsx";
import Button from "../../../components/button/Button.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Loader from "../../../components/loader/Loader.tsx";
import EmailModal from "../../../components/emailModal/EmailModal.tsx";
import ModernPDFViewer from "../../../components/pdfViewer/ModernPDFViewer.tsx";

// context
import { CourrierContext } from "../../../context/courrier/CourrierContext.tsx";

// hooks
import { useCourrierSelection } from "../../../hooks/useCourrierSelection.ts";
import { useCourrierActions } from "../../../hooks/useCourrierActions.ts";
import { useTooltip } from "../../../hooks/useTooltip.ts";

// utils
import { handleCourrierLoadError, logError, showErrorNotification } from "../../../utils/scripts/errorHandling.ts";

// types
import { ICourrier } from "../../../utils/types/courrier.types.ts";

function ListeCourriers(): ReactElement {
  const navigate = useNavigate();
  const { courriers, pagination, getAllCourriers, downloadCourrier, deleteCourrier, isLoading } = useContext(CourrierContext);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm]   = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);

  const filteredCourriers = courriers.filter(c =>
    c.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.kind?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.emitter?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { selected, toggle, toggleAll, clear, isAllSelected } = useCourrierSelection(filteredCourriers);
  const { tooltip, handleMouseEnter, handleMouseMove, handleMouseLeave } = useTooltip();

  const loadCourriers = async (page: number, limit = 10) => {
    try {
      await getAllCourriers(page, limit);
    } catch (error) {
      logError('loadCourriers', error);
      showErrorNotification(handleCourrierLoadError(error));
    }
  };

  const {
    pdfModal, emailModal, bulkEmailModal,
    handleAdaptiveDownload, handleAdaptiveEmail,
    handleSendEmail, handleSendBulkEmail,
    handleDelete, handleViewPdf,
    closePdfModal, closeEmailModal, closeBulkEmailModal,
    getDownloadTooltip, getEmailTooltip,
  } = useCourrierActions(courriers, downloadCourrier, deleteCourrier, loadCourriers, currentPage, selected, clear);

  useEffect(() => {
    if (searchTerm.trim().length >= 3) loadCourriers(1, 100);
    else if (!searchTerm.trim()) loadCourriers(currentPage);
  }, [currentPage, searchTerm]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop((window.pageYOffset || document.documentElement.scrollTop) > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim() && currentPage !== 1) setCurrentPage(1);
  };

  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleDateString('fr-FR') : 'N/A';

  const getDirectionBadge = (direction: string) =>
    ({ entrant: 'badge-entrant', sortant: 'badge-sortant', interne: 'badge-interne' }[direction] ?? '');

  return (
    <>
      <Header />
      <SubNav />
      <main id="listeCourriers" className="listeCourrierMain">
        <div className="mobileSearchContainer mobileOnly">
          <div className="searchWrapper">
            <MdSearch className="searchIcon" />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={handleSearchChange} className="searchInput" />
          </div>
        </div>

        <div className="listeCourrierContainer">
          <header className="listeCourrierHeader" data-aos="fade-down">
            <Button style="back" onClick={() => navigate("/mail")} type="button">
              <MdArrowBack /><span>Retour</span>
            </Button>
            <h1 className="pageTitle">Liste des courriers</h1>
          </header>

          <section className="searchSection" data-aos="fade-up" data-aos-delay="100">
            <div className="searchContainer desktopOnly">
              <MdSearch className="searchIcon" />
              <input type="text" placeholder="Nom, type, service..." value={searchTerm} onChange={handleSearchChange} className="searchInput" />
            </div>
            {searchTerm.trim() && (
              <div className="searchResults">
                <span className="resultsCount">
                  {filteredCourriers.length} résultat{filteredCourriers.length > 1 ? 's' : ''} trouvé{filteredCourriers.length > 1 ? 's' : ''} pour "{searchTerm}"
                </span>
              </div>
            )}
            {!searchTerm.trim() && pagination && pagination.totalPages > 1 && (
              <div className="paginationControls">
                <button className="paginationBtn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                  <MdNavigateBefore /> Précédent
                </button>
                <div className="paginationInfo">
                  <span>Page {currentPage} sur {pagination.totalPages}</span>
                  <span className="totalItems">{pagination.total} courrier{pagination.total > 1 ? 's' : ''}</span>
                </div>
                <button className="paginationBtn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === pagination.totalPages}>
                  Suivant <MdNavigateNext />
                </button>
              </div>
            )}
          </section>

          <section className="courriersSection" data-aos="fade-up" data-aos-delay="200">
            {isLoading ? (
              <div className="loadingState"><Loader size="large" message="Chargement des courriers..." /></div>
            ) : filteredCourriers.length === 0 ? (
              <div className="emptyState"><FiFileText className="emptyIcon" /><p>Aucun courrier trouvé</p></div>
            ) : (
              <>
                {/* Vue Mobile */}
                <div className="courriersCards mobileOnly">
                  <div className="mobileSelectAll">
                    <label className="checkboxWrapper">
                      <input type="checkbox" checked={isAllSelected} onChange={e => toggleAll(e.target.checked)} className="selectAllCheckbox" />
                      <span className="checkboxLabel"><MdSelectAll /></span>
                    </label>
                    <span className="selectAllText">
                      {selected.size > 0 ? `${selected.size} sélectionné${selected.size > 1 ? 's' : ''}` : 'Tout sélectionner'}
                    </span>
                  </div>
                  <div className="cardsList">
                    {filteredCourriers.map((courrier: ICourrier) => (
                      <div key={courrier.id} className={`courrierCard ${selected.has(courrier.id) ? 'selected' : ''}`}>
                        <div className="cardHeader">
                          <div className="cardSelect">
                            <label className="checkboxWrapper">
                              <input type="checkbox" checked={selected.has(courrier.id)} onChange={e => toggle(courrier.id, e.target.checked)} className="selectCheckbox" />
                              <span className="checkmark"></span>
                            </label>
                          </div>
                          <div className="cardTitle">
                            <FiFileText className="fileIcon" />
                            <h3 className="fileName" title={courrier.fileName}>{courrier.fileName}</h3>
                          </div>
                          <div className="cardDirection">
                            <span className={`directionBadge ${getDirectionBadge(courrier.direction)}`}>{courrier.direction}</span>
                          </div>
                        </div>
                        <div className="cardBody">
                          <div className="cardInfo">
                            <div className="infoRow"><span className="infoLabel">Type:</span><span className="infoValue">{courrier.kind || 'N/A'}</span></div>
                            <div className="infoRow"><span className="infoLabel">Service:</span><span className="infoValue">{courrier.department || 'N/A'}</span></div>
                            <div className="infoRow"><span className="infoLabel">Expéditeur:</span><span className="infoValue">{courrier.emitter || 'N/A'}</span></div>
                            <div className="infoRow"><span className="infoLabel">Date:</span><span className="infoValue">{formatDate(courrier.courrierDate)}</span></div>
                            {courrier.description && (
                              <div className="infoRow description"><span className="infoLabel">Description:</span><span className="infoValue">{courrier.description}</span></div>
                            )}
                          </div>
                        </div>
                        <div className="cardActions">
                          <button className={`actionBtn view ${selected.size > 0 ? 'disabled' : ''}`} onClick={() => selected.size === 0 && handleViewPdf(courrier)} title={selected.size > 0 ? 'Désactivé pendant la sélection' : 'Visualiser'} disabled={selected.size > 0}><MdVisibility /></button>
                          <button className="actionBtn download" onClick={() => handleAdaptiveDownload(courrier.id)} title={getDownloadTooltip()}>{selected.size > 1 ? <MdArchive /> : <MdDownload />}</button>
                          <button className={`actionBtn edit ${selected.size > 0 ? 'disabled' : ''}`} onClick={() => selected.size === 0 && navigate(`/mail/update/${courrier.id}`)} title={selected.size > 0 ? 'Désactivé pendant la sélection' : 'Modifier'} disabled={selected.size > 0}><MdEdit /></button>
                          <button className="actionBtn email" onClick={() => handleAdaptiveEmail(courrier.id)} title={getEmailTooltip()}>{selected.size > 1 ? <MdOutlineMarkEmailRead /> : <MdEmail />}</button>
                          <button className={`actionBtn delete ${selected.size > 0 ? 'disabled' : ''}`} onClick={() => selected.size === 0 && handleDelete(courrier.id)} title={selected.size > 0 ? 'Désactivé pendant la sélection' : 'Supprimer'} disabled={selected.size > 0}><MdDelete /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vue Desktop */}
                <div className="courriersTable desktopOnly">
                  <div className="tableWrapper">
                    <table className="courriersGrid">
                      <thead>
                        <tr>
                          <th className="selectColumn">
                            <label className="checkboxWrapper">
                              <input type="checkbox" checked={isAllSelected} onChange={e => toggleAll(e.target.checked)} className="selectAllCheckbox" />
                            </label>
                          </th>
                          <th>Nom du fichier</th>
                          <th>Direction</th>
                          <th>Type</th>
                          <th>Service</th>
                          <th>Expéditeur</th>
                          <th className="dateColumn">Date courrier</th>
                          <th>Description</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCourriers.map((courrier: ICourrier) => (
                          <tr key={courrier.id} className={`courrierRow ${selected.has(courrier.id) ? 'selected' : ''}`}>
                            <td className="selectColumn">
                              <label className="checkboxWrapper">
                                <input type="checkbox" checked={selected.has(courrier.id)} onChange={e => toggle(courrier.id, e.target.checked)} className="selectCheckbox" />
                                <span className="checkmark"></span>
                              </label>
                            </td>
                            <td className="fileName">
                              <div className="fileNameWrapper">
                                <FiFileText className="fileIcon" />
                                <span className="fileNameText" onMouseEnter={e => handleMouseEnter(e, courrier.fileName)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                                  {courrier.fileName}
                                </span>
                              </div>
                            </td>
                            <td className="direction">
                              <span className={`directionBadge ${getDirectionBadge(courrier.direction)}`}>{courrier.direction}</span>
                            </td>
                            <td className="kind" onMouseEnter={e => handleMouseEnter(e, courrier.kind || 'N/A')} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>{courrier.kind || 'N/A'}</td>
                            <td className="department" onMouseEnter={e => handleMouseEnter(e, courrier.department || 'N/A')} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>{courrier.department || 'N/A'}</td>
                            <td className="emitter" onMouseEnter={e => handleMouseEnter(e, courrier.emitter || 'N/A')} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>{courrier.emitter || 'N/A'}</td>
                            <td className="courrierDate">{formatDate(courrier.courrierDate)}</td>
                            <td className="description" onMouseEnter={e => handleMouseEnter(e, courrier.description || 'N/A')} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>{courrier.description || 'N/A'}</td>
                            <td className="actions">
                              <div className="actionButtons">
                                <button className={`actionBtn view ${selected.size > 0 ? 'disabled' : ''}`} onClick={() => selected.size === 0 && handleViewPdf(courrier)} title={selected.size > 0 ? 'Désactivé pendant la sélection' : 'Visualiser'} disabled={selected.size > 0}><MdVisibility /></button>
                                <button className="actionBtn download" onClick={() => handleAdaptiveDownload(courrier.id)} title={getDownloadTooltip()}>{selected.size > 1 ? <MdArchive /> : <MdDownload />}</button>
                                <button className={`actionBtn edit ${selected.size > 0 ? 'disabled' : ''}`} onClick={() => selected.size === 0 && navigate(`/mail/update/${courrier.id}`)} title={selected.size > 0 ? 'Désactivé pendant la sélection' : 'Modifier'} disabled={selected.size > 0}><MdEdit /></button>
                                <button className="actionBtn email" onClick={() => handleAdaptiveEmail(courrier.id)} title={getEmailTooltip()}>{selected.size > 1 ? <MdOutlineMarkEmailRead /> : <MdEmail />}</button>
                                <button className={`actionBtn delete ${selected.size > 0 ? 'disabled' : ''}`} onClick={() => selected.size === 0 && handleDelete(courrier.id)} title={selected.size > 0 ? 'Désactivé pendant la sélection' : 'Supprimer'} disabled={selected.size > 0}><MdDelete /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        {!searchTerm.trim() && pagination && pagination.totalPages > 1 && (
          <div className="mobilePagination mobileOnly">
            <div className="paginationControls">
              <button className="paginationBtn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><MdNavigateBefore /> Précédent</button>
              <div className="paginationInfo">
                <span>Page {currentPage} sur {pagination.totalPages}</span>
                <span className="totalItems">{pagination.total} courrier{pagination.total > 1 ? 's' : ''}</span>
              </div>
              <button className="paginationBtn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === pagination.totalPages}>Suivant <MdNavigateNext /></button>
            </div>
          </div>
        )}
      </main>

      {tooltip.visible && (
        <div className="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>{tooltip.content}</div>
      )}

      <Modal isVisible={pdfModal.visible} onClose={closePdfModal} title={pdfModal.fileName || `Visualisation ${pdfModal.fileType.toUpperCase()}`}>
        {pdfModal.fileType === 'image'
          ? <img src={pdfModal.pdfUrl} alt={pdfModal.fileName} className="modal-content-image" />
          : <div id="pdfViewer"><ModernPDFViewer pdfUrl={pdfModal.pdfUrl} fileName={pdfModal.fileName || 'document.pdf'} /></div>
        }
      </Modal>

      <EmailModal isVisible={emailModal.visible} courrier={emailModal.courrier} onClose={closeEmailModal} onSend={handleSendEmail} isLoading={emailModal.isLoading} />
      <EmailModal isVisible={bulkEmailModal.visible} courrier={bulkEmailModal.courriers[0] || null} onClose={closeBulkEmailModal} onSend={handleSendBulkEmail} isLoading={bulkEmailModal.isLoading} bulkMode={true} selectedCount={bulkEmailModal.courriers.length} />

      {showBackToTop && (
        <button className="backToTopBtn mobileOnly" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Retour en haut">
          <MdKeyboardArrowUp />
        </button>
      )}
    </>
  );
}

const ListeCourriersWithAuth = WithAuth(ListeCourriers);
export default ListeCourriersWithAuth;
