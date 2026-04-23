// styles
import "./listeCourriers.scss";

// hooks | libraries
import { ReactElement, useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdDownload,
  MdEdit,
  MdDelete,
  MdEmail,
  MdSearch,
  MdNavigateNext,
  MdNavigateBefore,
  MdVisibility,
  MdArchive,
  MdOutlineMarkEmailRead,
  MdSelectAll,
  MdKeyboardArrowUp,
  MdArrowUpward,
  MdArrowDownward,
  MdFilterList,
  MdFilterListOff,
} from "react-icons/md";
import Select from "react-select";
import { FiFileText } from "react-icons/fi";

// components
import WithAuth from "../../../utils/middleware/WithAuth.tsx";
import Header from "../../components/header/Header.tsx";
import SubNav from "../../components/subNav/SubNav.tsx";
import Button from "../../components/button/Button.tsx";
import Modal from "../../components/modal/Modal.tsx";
import Loader from "../../components/loader/Loader.tsx";
import EmailModal from "../../components/emailModal/EmailModal.tsx";
import ModernPDFViewer from "../../components/modernPdfViewer/ModernPDFViewer.tsx";

// context
import { CourrierContext } from "../../../context/courrierContext/CourrierContext";

// hooks
import { useCourrierSelection } from "../../../hooks/useCourrierSelection.ts";
import { useCourrierActions } from "../../../hooks/useCourrierActions.ts";
import { useTooltip } from "../../../hooks/useTooltip.ts";
import { useCourrierFieldOptions } from "../../../hooks/useCourrierFieldOptions.ts";

// utils
import { handleCourrierLoadError, logError, showErrorNotification } from "../../../utils/scripts/errorHandling.ts";
import { formatDate, getDirectionBadge } from "../../../utils/scripts/formatters.ts";

// types
import { ICourrier, CourrierSortColumn, SortOrder, IColumnFilters } from "../../../utils/types/courrier.types.ts";

interface ISelectOption {
  value: string;
  label: string;
}

function ListeCourriers(): ReactElement {
  const navigate = useNavigate();
  const { courriers, pagination, getAllCourriers, downloadCourrier, deleteCourrier, isLoading } = useContext(CourrierContext);

  // --- State UI ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<CourrierSortColumn | "">("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("DESC");
  const [columnFilters, setColumnFilters] = useState<IColumnFilters>({
    kind: "",
    department: "",
    emitter: "",
    recipient: "",
    direction: "",
    dateMin: "",
    dateMax: "",
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // --- Filtres options ---
  const kindOptions = useCourrierFieldOptions("kind");
  const departmentOptions = useCourrierFieldOptions("department");
  const emitterOptions = useCourrierFieldOptions("emitter");
  const recipientOptions = useCourrierFieldOptions("recipient");

  // --- Filtrage client (recherche texte) ---
  const normalize = (str: string): string =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredCourriers = courriers.filter((courrier: ICourrier) => {
    const term = normalize(searchTerm);
    return (
      normalize(courrier.fileName).includes(term) ||
      normalize(courrier.kind ?? "").includes(term) ||
      normalize(courrier.department ?? "").includes(term) ||
      normalize(courrier.emitter ?? "").includes(term) ||
      normalize(courrier.description ?? "").includes(term) ||
      normalize(courrier.recipient ?? "").includes(term)
    );
  });

  // --- Hooks métier ---
  const { selected, toggle, toggleAll, clear, isAllSelected } = useCourrierSelection(filteredCourriers);
  const { tooltip, handleMouseEnter, handleMouseMove, handleMouseLeave } = useTooltip();

  const loadCourriers = useCallback(async (page: number, limit = 10): Promise<void> => {
    try {
      await getAllCourriers({
        page,
        limit,
        sortBy: sortBy || undefined,
        sortOrder: sortBy ? sortOrder : undefined,
        filterKind: columnFilters.kind || undefined,
        filterDepartment: columnFilters.department || undefined,
        filterEmitter: columnFilters.emitter || undefined,
        filterRecipient: columnFilters.recipient || undefined,
        filterDirection: (columnFilters.direction as "entrant" | "sortant" | "interne") || undefined,
        filterDateMin: columnFilters.dateMin || undefined,
        filterDateMax: columnFilters.dateMax || undefined,
      });
    } catch (error: unknown) {
      logError("loadCourriers", error);
      showErrorNotification(handleCourrierLoadError(error));
    }
  }, [getAllCourriers, sortBy, sortOrder, columnFilters]);

  const {
    pdfModal, emailModal, bulkEmailModal,
    handleAdaptiveDownload, handleAdaptiveEmail,
    handleSendEmail, handleSendBulkEmail,
    handleDelete, handleViewPdf,
    closePdfModal, closeEmailModal, closeBulkEmailModal,
    getDownloadTooltip, getEmailTooltip,
  } = useCourrierActions(courriers, downloadCourrier, deleteCourrier, loadCourriers, currentPage, selected, clear);

  // --- Effects ---
  useEffect(() => {
    if (searchTerm.trim() && searchTerm.trim().length >= 3) {
      loadCourriers(1, 100);
    } else if (!searchTerm.trim()) {
      loadCourriers(currentPage);
    }
  }, [currentPage, searchTerm, sortBy, sortOrder, columnFilters, loadCourriers]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Handlers UI ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim() && currentPage !== 1) setCurrentPage(1);
  };

  const handleSort = (column: CourrierSortColumn) => {
    if (sortBy === column) {
      if (sortOrder === "ASC") {
        setSortOrder("DESC");
      } else {
        setSortBy("");
        setSortOrder("DESC");
      }
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (field: keyof IColumnFilters, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setColumnFilters({ kind: "", department: "", emitter: "", recipient: "", direction: "", dateMin: "", dateMax: "" });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(columnFilters).some((v) => v !== "");

  // --- Helpers ---
  const renderSortIcon = (column: CourrierSortColumn): ReactElement | null => {
    if (sortBy !== column) return null;
    return sortOrder === "ASC"
      ? <MdArrowUpward className="sortIcon" />
      : <MdArrowDownward className="sortIcon" />;
  };

  const toSelectOptions = (options: string[]): ISelectOption[] =>
    options.map((o) => ({ value: o, label: o }));

  const directionSelectOptions: ISelectOption[] = [
    { value: "entrant", label: "Entrant" },
    { value: "sortant", label: "Sortant" },
    { value: "interne", label: "Interne" },
  ];

  return (
    <>
      <Header />
      <SubNav />
      <main id="listeCourriers" className="listeCourrierMain">
        {/* Barre de recherche mobile sticky */}
        <div className="mobileSearchContainer mobileOnly">
          <div className="searchWrapper">
            <MdSearch className="searchIcon" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="searchInput"
            />
          </div>
        </div>

        <div className="listeCourrierContainer">
          {/* Header */}
          <header className="listeCourrierHeader" data-aos="fade-down">
            <Button style="back" onClick={() => navigate("/mail")} type="button">
              <MdArrowBack />
              <span>Retour</span>
            </Button>
            <h1 className="pageTitle">Liste des courriers</h1>
          </header>

          {/* Search, filtres et pagination */}
          <section className="searchSection" data-aos="fade-up" data-aos-delay="100">
            <div className="searchContainer desktopOnly">
              <MdSearch className="searchIcon" />
              <input
                type="text"
                placeholder="Nom, type, service..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="searchInput"
              />
            </div>

            <button
              type="button"
              className={`filterToggleBtn ${showFilters ? "active" : ""} ${hasActiveFilters ? "hasFilters" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
              title={showFilters ? "Masquer les filtres" : "Afficher les filtres"}
            >
              {showFilters ? <MdFilterListOff /> : <MdFilterList />}
              <span>Filtres</span>
              {hasActiveFilters && <span className="filterBadge" />}
            </button>

            {searchTerm.trim() && (
              <div className="searchResults">
                <span className="resultsCount">
                  {filteredCourriers.length} résultat{filteredCourriers.length > 1 ? "s" : ""} trouvé{filteredCourriers.length > 1 ? "s" : ""} pour &quot;{searchTerm}&quot;
                </span>
              </div>
            )}

            {!searchTerm.trim() && pagination && pagination.totalPages > 1 && (
              <div className="paginationControls">
                <button
                  className="paginationBtn"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                >
                  <MdNavigateBefore />
                  Précédent
                </button>
                <div className="paginationInfo">
                  <span>Page {currentPage} sur {pagination.totalPages}</span>
                  <span className="totalItems">{pagination.total} courrier{pagination.total > 1 ? "s" : ""}</span>
                </div>
                <button
                  className="paginationBtn"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  Suivant
                  <MdNavigateNext />
                </button>
              </div>
            )}
          </section>

          {/* Section filtres */}
          {showFilters && (
            <section className="filterSection" data-aos="fade-down">
              <div className="filterSelect">
                <Select<ISelectOption>
                  value={columnFilters.kind ? { value: columnFilters.kind, label: columnFilters.kind } : null}
                  onChange={(opt) => handleFilterChange("kind", opt?.value || "")}
                  options={toSelectOptions(kindOptions.options)}
                  isClearable
                  placeholder="Type..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isLoading={kindOptions.isLoading}
                />
              </div>
              <div className="filterSelect">
                <Select<ISelectOption>
                  value={columnFilters.department ? { value: columnFilters.department, label: columnFilters.department } : null}
                  onChange={(opt) => handleFilterChange("department", opt?.value || "")}
                  options={toSelectOptions(departmentOptions.options)}
                  isClearable
                  placeholder="Service..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isLoading={departmentOptions.isLoading}
                />
              </div>
              <div className="filterSelect">
                <Select<ISelectOption>
                  value={columnFilters.emitter ? { value: columnFilters.emitter, label: columnFilters.emitter } : null}
                  onChange={(opt) => handleFilterChange("emitter", opt?.value || "")}
                  options={toSelectOptions(emitterOptions.options)}
                  isClearable
                  placeholder="Expéditeur..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isLoading={emitterOptions.isLoading}
                />
              </div>
              <div className="filterSelect">
                <Select<ISelectOption>
                  value={columnFilters.recipient ? { value: columnFilters.recipient, label: columnFilters.recipient } : null}
                  onChange={(opt) => handleFilterChange("recipient", opt?.value || "")}
                  options={toSelectOptions(recipientOptions.options)}
                  isClearable
                  placeholder="Destinataire..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isLoading={recipientOptions.isLoading}
                />
              </div>
              <div className="filterSelect">
                <Select<ISelectOption>
                  value={columnFilters.direction ? directionSelectOptions.find((o) => o.value === columnFilters.direction) || null : null}
                  onChange={(opt) => handleFilterChange("direction", opt?.value || "")}
                  options={directionSelectOptions}
                  isClearable
                  placeholder="Direction..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              <div className="filterDateGroup">
                <span className="filterDateLabel">Date de réception</span>
                <div className="filterDateInputs">
                  <input
                    type="date"
                    value={columnFilters.dateMin}
                    onChange={(e) => handleFilterChange("dateMin", e.target.value)}
                    className="filterDateInput"
                    max={columnFilters.dateMax || undefined}
                    title="Date minimum"
                  />
                  <span className="filterDateSeparator">→</span>
                  <input
                    type="date"
                    value={columnFilters.dateMax}
                    onChange={(e) => handleFilterChange("dateMax", e.target.value)}
                    className="filterDateInput"
                    min={columnFilters.dateMin || undefined}
                    title="Date maximum"
                  />
                </div>
              </div>
              {hasActiveFilters && (
                <button type="button" className="clearFiltersBtn" onClick={clearAllFilters}>
                  <MdFilterListOff />
                  <span>Effacer</span>
                </button>
              )}
            </section>
          )}

          {/* Liste des courriers */}
          <section className="courriersSection" data-aos="fade-up" data-aos-delay="200">
            {isLoading ? (
              <div className="loadingState">
                <Loader size="large" message="Chargement des courriers..." />
              </div>
            ) : filteredCourriers.length === 0 ? (
              <div className="emptyState">
                <FiFileText className="emptyIcon" />
                <p>Aucun courrier trouvé</p>
              </div>
            ) : (
              <>
                {/* Vue Mobile - Cartes */}
                <div className="courriersCards mobileOnly">
                  <div className="mobileSelectAll">
                    <label className="checkboxWrapper">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => toggleAll(e.target.checked)}
                        className="selectAllCheckbox"
                      />
                      <span className="checkboxLabel">
                        <MdSelectAll />
                      </span>
                    </label>
                    <span className="selectAllText">
                      {selected.size > 0
                        ? `${selected.size} sélectionné${selected.size > 1 ? "s" : ""}`
                        : "Tout sélectionner"}
                    </span>
                  </div>

                  <div className="cardsList">
                    {filteredCourriers.map((courrier: ICourrier) => (
                      <div
                        key={courrier.id}
                        className={`courrierCard ${selected.has(courrier.id) ? "selected" : ""}`}
                      >
                        <div className="cardHeader">
                          <div className="cardSelect">
                            <label className="checkboxWrapper">
                              <input
                                type="checkbox"
                                checked={selected.has(courrier.id)}
                                onChange={(e) => toggle(courrier.id, e.target.checked)}
                                className="selectCheckbox"
                              />
                              <span className="checkmark"></span>
                            </label>
                          </div>
                          <div className="cardTitle">
                            <FiFileText className="fileIcon" />
                            <h3 className="fileName" title={courrier.fileName}>{courrier.fileName}</h3>
                          </div>
                          <div className="cardDirection">
                            <span className={`directionBadge ${getDirectionBadge(courrier.direction)}`}>
                              {courrier.direction}
                            </span>
                          </div>
                        </div>

                        <div className="cardBody">
                          <div className="cardInfo">
                            <div className="infoRow">
                              <span className="infoLabel">Type:</span>
                              <span className="infoValue">{courrier.kind || "N/A"}</span>
                            </div>
                            <div className="infoRow">
                              <span className="infoLabel">Service:</span>
                              <span className="infoValue">{courrier.department || "N/A"}</span>
                            </div>
                            <div className="infoRow">
                              <span className="infoLabel">Expéditeur:</span>
                              <span className="infoValue">{courrier.emitter || "N/A"}</span>
                            </div>
                            <div className="infoRow">
                              <span className="infoLabel">Date:</span>
                              <span className="infoValue">{formatDate(courrier.courrierDate)}</span>
                            </div>
                            {courrier.description && (
                              <div className="infoRow description">
                                <span className="infoLabel">Description:</span>
                                <span className="infoValue">{courrier.description}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="cardActions">
                          <button
                            className={`actionBtn view ${selected.size > 0 ? "disabled" : ""}`}
                            onClick={() => selected.size === 0 && handleViewPdf(courrier)}
                            title={selected.size > 0 ? "Désactivé pendant la sélection" : "Visualiser"}
                            disabled={selected.size > 0}
                          >
                            <MdVisibility />
                          </button>
                          <button
                            className="actionBtn download"
                            onClick={() => handleAdaptiveDownload(courrier.id)}
                            title={getDownloadTooltip()}
                          >
                            {selected.size > 1 ? <MdArchive /> : <MdDownload />}
                          </button>
                          <button
                            className={`actionBtn edit ${selected.size > 0 ? "disabled" : ""}`}
                            onClick={() => selected.size === 0 && navigate(`/mail/update/${courrier.id}`)}
                            title={selected.size > 0 ? "Désactivé pendant la sélection" : "Modifier"}
                            disabled={selected.size > 0}
                          >
                            <MdEdit />
                          </button>
                          <button
                            className="actionBtn email"
                            onClick={() => handleAdaptiveEmail(courrier.id)}
                            title={getEmailTooltip()}
                          >
                            {selected.size > 1 ? <MdOutlineMarkEmailRead /> : <MdEmail />}
                          </button>
                          <button
                            className={`actionBtn delete ${selected.size > 0 ? "disabled" : ""}`}
                            onClick={() => selected.size === 0 && handleDelete(courrier.id)}
                            title={selected.size > 0 ? "Désactivé pendant la sélection" : "Supprimer"}
                            disabled={selected.size > 0}
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vue Desktop - Tableau */}
                <div className="courriersTable desktopOnly">
                  <div className="tableWrapper">
                    <table className="courriersGrid">
                      <thead>
                        <tr>
                          <th className="selectColumn">
                            <label className="checkboxWrapper">
                              <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={(e) => toggleAll(e.target.checked)}
                                className="selectAllCheckbox"
                              />
                            </label>
                          </th>
                          <th
                            className={`sortable ${sortBy === "fileName" ? "sorted" : ""}`}
                            onClick={() => handleSort("fileName")}
                          >
                            Nom du fichier {renderSortIcon("fileName")}
                          </th>
                          <th
                            className={`sortable ${sortBy === "direction" ? "sorted" : ""}`}
                            onClick={() => handleSort("direction")}
                          >
                            Direction {renderSortIcon("direction")}
                          </th>
                          <th
                            className={`sortable ${sortBy === "kind" ? "sorted" : ""}`}
                            onClick={() => handleSort("kind")}
                          >
                            Type {renderSortIcon("kind")}
                          </th>
                          <th
                            className={`sortable ${sortBy === "department" ? "sorted" : ""}`}
                            onClick={() => handleSort("department")}
                          >
                            Service {renderSortIcon("department")}
                          </th>
                          <th
                            className={`sortable ${sortBy === "emitter" ? "sorted" : ""}`}
                            onClick={() => handleSort("emitter")}
                          >
                            Expéditeur {renderSortIcon("emitter")}
                          </th>
                          <th
                            className={`sortable dateColumn ${sortBy === "courrierDate" ? "sorted" : ""}`}
                            onClick={() => handleSort("courrierDate")}
                          >
                            Date courrier {renderSortIcon("courrierDate")}
                          </th>
                          <th
                            className={`sortable ${sortBy === "description" ? "sorted" : ""}`}
                            onClick={() => handleSort("description")}
                          >
                            Description {renderSortIcon("description")}
                          </th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCourriers.map((courrier: ICourrier) => (
                          <tr
                            key={courrier.id}
                            className={`courrierRow ${selected.has(courrier.id) ? "selected" : ""}`}
                          >
                            <td className="selectColumn">
                              <label className="checkboxWrapper">
                                <input
                                  type="checkbox"
                                  checked={selected.has(courrier.id)}
                                  onChange={(e) => toggle(courrier.id, e.target.checked)}
                                  className="selectCheckbox"
                                />
                                <span className="checkmark"></span>
                              </label>
                            </td>
                            <td className="fileName">
                              <div className="fileNameWrapper">
                                <FiFileText className="fileIcon" />
                                <span
                                  className="fileNameText"
                                  onMouseEnter={(e) => handleMouseEnter(e, courrier.fileName)}
                                  onMouseMove={handleMouseMove}
                                  onMouseLeave={handleMouseLeave}
                                >
                                  {courrier.fileName}
                                </span>
                              </div>
                            </td>
                            <td className="direction">
                              <span className={`directionBadge ${getDirectionBadge(courrier.direction)}`}>
                                {courrier.direction}
                              </span>
                            </td>
                            <td
                              className="kind"
                              onMouseEnter={(e) => handleMouseEnter(e, courrier.kind || "N/A")}
                              onMouseMove={handleMouseMove}
                              onMouseLeave={handleMouseLeave}
                            >
                              {courrier.kind || "N/A"}
                            </td>
                            <td
                              className="department"
                              onMouseEnter={(e) => handleMouseEnter(e, courrier.department || "N/A")}
                              onMouseMove={handleMouseMove}
                              onMouseLeave={handleMouseLeave}
                            >
                              {courrier.department || "N/A"}
                            </td>
                            <td
                              className="emitter"
                              onMouseEnter={(e) => handleMouseEnter(e, courrier.emitter || "N/A")}
                              onMouseMove={handleMouseMove}
                              onMouseLeave={handleMouseLeave}
                            >
                              {courrier.emitter || "N/A"}
                            </td>
                            <td className="courrierDate">{formatDate(courrier.courrierDate)}</td>
                            <td
                              className="description"
                              onMouseEnter={(e) => handleMouseEnter(e, courrier.description || "N/A")}
                              onMouseMove={handleMouseMove}
                              onMouseLeave={handleMouseLeave}
                            >
                              {courrier.description || "N/A"}
                            </td>
                            <td className="actions">
                              <div className="actionButtons">
                                <button
                                  className={`actionBtn view ${selected.size > 0 ? "disabled" : ""}`}
                                  onClick={() => selected.size === 0 && handleViewPdf(courrier)}
                                  title={selected.size > 0 ? "Désactivé pendant la sélection" : "Visualiser"}
                                  disabled={selected.size > 0}
                                >
                                  <MdVisibility />
                                </button>
                                <button
                                  className="actionBtn download"
                                  onClick={() => handleAdaptiveDownload(courrier.id)}
                                  title={getDownloadTooltip()}
                                >
                                  {selected.size > 1 ? <MdArchive /> : <MdDownload />}
                                </button>
                                <button
                                  className={`actionBtn edit ${selected.size > 0 ? "disabled" : ""}`}
                                  onClick={() => selected.size === 0 && navigate(`/mail/update/${courrier.id}`)}
                                  title={selected.size > 0 ? "Désactivé pendant la sélection" : "Modifier"}
                                  disabled={selected.size > 0}
                                >
                                  <MdEdit />
                                </button>
                                <button
                                  className="actionBtn email"
                                  onClick={() => handleAdaptiveEmail(courrier.id)}
                                  title={getEmailTooltip()}
                                >
                                  {selected.size > 1 ? <MdOutlineMarkEmailRead /> : <MdEmail />}
                                </button>
                                <button
                                  className={`actionBtn delete ${selected.size > 0 ? "disabled" : ""}`}
                                  onClick={() => selected.size === 0 && handleDelete(courrier.id)}
                                  title={selected.size > 0 ? "Désactivé pendant la sélection" : "Supprimer"}
                                  disabled={selected.size > 0}
                                >
                                  <MdDelete />
                                </button>
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

        {/* Pagination mobile en bas */}
        {!searchTerm.trim() && pagination && pagination.totalPages > 1 && (
          <div className="mobilePagination mobileOnly">
            <div className="paginationControls">
              <button
                className="paginationBtn"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
              >
                <MdNavigateBefore />
                Précédent
              </button>
              <div className="paginationInfo">
                <span>Page {currentPage} sur {pagination.totalPages}</span>
                <span className="totalItems">{pagination.total} courrier{pagination.total > 1 ? "s" : ""}</span>
              </div>
              <button
                className="paginationBtn"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                Suivant
                <MdNavigateNext />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Modale PDF/Image */}
      <Modal
        isVisible={pdfModal.visible}
        onClose={closePdfModal}
        title={pdfModal.fileName || `Visualisation ${pdfModal.fileType.toUpperCase()}`}
      >
        {pdfModal.fileType === "image" ? (
          <img
            src={pdfModal.pdfUrl}
            alt={pdfModal.fileName}
            className="modal-content-image"
          />
        ) : (
          <div id="pdfViewer">
            <ModernPDFViewer
              pdfUrl={pdfModal.pdfUrl}
              fileName={pdfModal.fileName || "document.pdf"}
            />
          </div>
        )}
      </Modal>

      {/* Modale Email */}
      <EmailModal
        isVisible={emailModal.visible}
        courrier={emailModal.courrier}
        onClose={closeEmailModal}
        onSend={handleSendEmail}
        isLoading={emailModal.isLoading}
      />

      {/* Modale Email Groupé */}
      <EmailModal
        isVisible={bulkEmailModal.visible}
        courrier={bulkEmailModal.courriers[0] || null}
        onClose={closeBulkEmailModal}
        onSend={handleSendBulkEmail}
        isLoading={bulkEmailModal.isLoading}
        bulkMode={true}
        selectedCount={bulkEmailModal.courriers.length}
      />

      {/* Bouton Back to Top */}
      {showBackToTop && (
        <button
          className="backToTopBtn mobileOnly"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="Retour en haut"
        >
          <MdKeyboardArrowUp />
        </button>
      )}
    </>
  );
}

const ListeCourriersWithAuth = WithAuth(ListeCourriers);
export default ListeCourriersWithAuth;
