import type { MouseEvent, ReactElement } from 'react';
import {
  MdArchive,
  MdArrowDownward,
  MdArrowUpward,
  MdDelete,
  MdDownload,
  MdEdit,
  MdEmail,
  MdMoreVert,
  MdOutlineMarkEmailRead,
  MdSelectAll,
  MdVisibility,
} from 'react-icons/md';
import { FiFileText } from 'react-icons/fi';

import { Loader } from '../index.ts';
import type { ListeCourriersViewModel } from '../../../hooks/index.ts';
import {
  formatCourrierDate,
  getCourrierDirectionBadgeClass,
} from '../../../utils/scripts/index.ts';
import type { CourrierSortColumn, ICourrier } from '../../../utils/types/index.ts';

interface CourrierListContentProps {
  viewModel: ListeCourriersViewModel;
}

interface CourrierActionsProps {
  courrier: ICourrier;
  selectionCount: number;
  onDelete: (id: number) => void;
  onDownload: (id: number) => void;
  onEdit: (id: number) => void;
  onEmail: (id: number) => void;
  onView: (courrier: ICourrier) => void;
  downloadTooltip: string;
  emailTooltip: string;
}

function CourrierActions({
  courrier,
  selectionCount,
  onDelete,
  onDownload,
  onEdit,
  onEmail,
  onView,
  downloadTooltip,
  emailTooltip,
}: CourrierActionsProps): ReactElement {
  const singleActionsDisabled = selectionCount > 0;

  return (
    <>
      <button
        className={`actionBtn view ${singleActionsDisabled ? 'disabled' : ''}`}
        onClick={() => onView(courrier)}
        title={singleActionsDisabled ? 'Désactivé pendant la sélection' : 'Visualiser'}
        disabled={singleActionsDisabled}
        type="button"
      >
        <MdVisibility />
      </button>
      <button
        className="actionBtn download"
        onClick={() => onDownload(courrier.id)}
        title={downloadTooltip}
        type="button"
      >
        {selectionCount > 1 ? <MdArchive /> : <MdDownload />}
      </button>
      <button
        className={`actionBtn edit ${singleActionsDisabled ? 'disabled' : ''}`}
        onClick={() => onEdit(courrier.id)}
        title={singleActionsDisabled ? 'Désactivé pendant la sélection' : 'Modifier'}
        disabled={singleActionsDisabled}
        type="button"
      >
        <MdEdit />
      </button>
      <button
        className="actionBtn email"
        onClick={() => onEmail(courrier.id)}
        title={emailTooltip}
        type="button"
      >
        {selectionCount > 1 ? <MdOutlineMarkEmailRead /> : <MdEmail />}
      </button>
      <button
        className={`actionBtn delete ${singleActionsDisabled ? 'disabled' : ''}`}
        onClick={() => onDelete(courrier.id)}
        title={singleActionsDisabled ? 'Désactivé pendant la sélection' : 'Supprimer'}
        disabled={singleActionsDisabled}
        type="button"
      >
        <MdDelete />
      </button>
    </>
  );
}

function SortIcon({
  column,
  sortBy,
  sortOrder,
}: {
  column: CourrierSortColumn;
  sortBy: CourrierSortColumn | '';
  sortOrder: 'ASC' | 'DESC';
}): ReactElement | null {
  if (sortBy !== column) return null;
  return sortOrder === 'ASC'
    ? <MdArrowUpward className="sortIcon" />
    : <MdArrowDownward className="sortIcon" />;
}

export function CourrierListContent({ viewModel }: CourrierListContentProps): ReactElement {
  const {
    closeActionMenu,
    courrierActions,
    filteredCourriers,
    handleEdit,
    hideTooltip,
    isLoading,
    moveTooltip,
    openActionMenu,
    selection,
    showTooltip,
    sortBy,
    sortOrder,
    toggleActionMenu,
    handleSort,
  } = viewModel;
  const selectionCount = selection.selected.size;
  const downloadTooltip = courrierActions.getDownloadTooltip();
  const emailTooltip = courrierActions.getEmailTooltip();
  const handleMouseEnter = (event: MouseEvent, content: string): void => {
    showTooltip(content, event.clientX, event.clientY);
  };
  const handleMouseMove = (event: MouseEvent): void => moveTooltip(event.clientX, event.clientY);
  const handleView = (courrier: ICourrier): void => {
    if (selectionCount === 0) void courrierActions.handleViewPdf(courrier);
  };
  const handleDelete = (id: number): void => {
    if (selectionCount === 0) void courrierActions.handleDelete(id);
  };
  const closeThen = (action: () => void): void => {
    closeActionMenu();
    action();
  };
  const actionProps = (courrier: ICourrier): CourrierActionsProps => ({
    courrier,
    selectionCount,
    onDelete: handleDelete,
    onDownload: (id) => { void courrierActions.handleAdaptiveDownload(id); },
    onEdit: handleEdit,
    onEmail: (id) => courrierActions.handleAdaptiveEmail(id),
    onView: handleView,
    downloadTooltip,
    emailTooltip,
  });

  if (isLoading) {
    return (
      <section className="courriersSection" data-aos="fade-up" data-aos-delay="200">
        <div className="loadingState">
          <Loader size="large" message="Chargement des courriers..." />
        </div>
      </section>
    );
  }

  if (filteredCourriers.length === 0) {
    return (
      <section className="courriersSection" data-aos="fade-up" data-aos-delay="200">
        <div className="emptyState">
          <FiFileText className="emptyIcon" />
          <p>Aucun courrier trouvé</p>
        </div>
      </section>
    );
  }

  return (
    <section className="courriersSection" data-aos="fade-up" data-aos-delay="200">
      <div className="courriersCards mobileOnly">
        <div className="mobileSelectAll">
          <label className="checkboxWrapper">
            <input
              type="checkbox"
              checked={selection.isAllSelected}
              onChange={(event) => selection.toggleAll(event.target.checked)}
              className="selectAllCheckbox"
            />
            <span className="checkboxLabel"><MdSelectAll /></span>
          </label>
          <span className="selectAllText">
            {selectionCount > 0
              ? `${selectionCount} sélectionné${selectionCount > 1 ? 's' : ''}`
              : 'Tout sélectionner'}
          </span>
        </div>

        <div className="cardsList">
          {filteredCourriers.map((courrier) => (
            <div
              key={courrier.id}
              className={`courrierCard ${selection.selected.has(courrier.id) ? 'selected' : ''}`}
            >
              <div className="cardHeader">
                <div className="cardSelect">
                  <label className="checkboxWrapper">
                    <input
                      type="checkbox"
                      checked={selection.selected.has(courrier.id)}
                      onChange={(event) => selection.toggle(courrier.id, event.target.checked)}
                      className="selectCheckbox"
                    />
                    <span className="checkmark" />
                  </label>
                </div>
                <div className="cardTitle">
                  <FiFileText className="fileIcon" />
                  <h3 className="fileName" title={courrier.fileName}>{courrier.fileName}</h3>
                </div>
                <div className="cardDirection">
                  <span className={`directionBadge ${getCourrierDirectionBadgeClass(courrier.direction)}`}>
                    {courrier.direction}
                  </span>
                </div>
              </div>

              <div className="cardBody">
                <div className="cardInfo">
                  <div className="infoRow"><span className="infoLabel">Type:</span><span className="infoValue">{courrier.kind || 'N/A'}</span></div>
                  <div className="infoRow"><span className="infoLabel">Service:</span><span className="infoValue">{courrier.department || 'N/A'}</span></div>
                  <div className="infoRow"><span className="infoLabel">Expéditeur:</span><span className="infoValue">{courrier.emitter || 'N/A'}</span></div>
                  <div className="infoRow"><span className="infoLabel">Date:</span><span className="infoValue">{formatCourrierDate(courrier.courrierDate)}</span></div>
                  {courrier.description && (
                    <div className="infoRow description"><span className="infoLabel">Description:</span><span className="infoValue">{courrier.description}</span></div>
                  )}
                </div>
              </div>

              <div className="cardActions"><CourrierActions {...actionProps(courrier)} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="courriersTable desktopOnly">
        <div className="tableWrapper">
          <table className="courriersGrid">
            <thead>
              <tr>
                <th className="selectColumn">
                  <label className="checkboxWrapper">
                    <input
                      type="checkbox"
                      checked={selection.isAllSelected}
                      onChange={(event) => selection.toggleAll(event.target.checked)}
                      className="selectAllCheckbox"
                    />
                  </label>
                </th>
                {([
                  ['fileName', 'Nom du fichier'],
                  ['direction', 'Direction'],
                  ['kind', 'Type'],
                  ['department', 'Service'],
                  ['emitter', 'Expediteur'],
                  ['recipient', 'Destinataire'],
                  ['courrierDate', 'Date courrier'],
                  ['description', 'Description'],
                ] as const).map(([column, label]) => (
                  <th
                    key={column}
                    className={`sortable ${column === 'courrierDate' ? 'dateColumn' : ''} ${sortBy === column ? 'sorted' : ''}`}
                    onClick={() => handleSort(column)}
                  >
                    {label} <SortIcon column={column} sortBy={sortBy} sortOrder={sortOrder} />
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourriers.map((courrier) => {
                const tooltipCell = (className: string, value?: string): ReactElement => {
                  const displayValue = value || 'N/A';
                  return (
                    <td
                      className={className}
                      onMouseEnter={(event) => handleMouseEnter(event, displayValue)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={hideTooltip}
                    >
                      {displayValue}
                    </td>
                  );
                };

                return (
                  <tr key={courrier.id} className={`courrierRow ${selection.selected.has(courrier.id) ? 'selected' : ''}`}>
                    <td className="selectColumn">
                      <label className="checkboxWrapper">
                        <input
                          type="checkbox"
                          checked={selection.selected.has(courrier.id)}
                          onChange={(event) => selection.toggle(courrier.id, event.target.checked)}
                          className="selectCheckbox"
                        />
                        <span className="checkmark" />
                      </label>
                    </td>
                    <td className="fileName">
                      <div className="fileNameWrapper">
                        <FiFileText className="fileIcon" />
                        <span
                          className="fileNameText"
                          onMouseEnter={(event) => handleMouseEnter(event, courrier.fileName)}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={hideTooltip}
                        >
                          {courrier.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="direction">
                      <span className={`directionBadge ${getCourrierDirectionBadgeClass(courrier.direction)}`}>
                        {courrier.direction}
                      </span>
                    </td>
                    {tooltipCell('kind', courrier.kind)}
                    {tooltipCell('department', courrier.department)}
                    {tooltipCell('emitter', courrier.emitter)}
                    {tooltipCell('recipient', courrier.recipient)}
                    <td className="courrierDate">{formatCourrierDate(courrier.courrierDate)}</td>
                    {tooltipCell('description', courrier.description)}
                    <td className="actions">
                      <div className="actionMenuWrapper">
                        <button
                          className="actionMenuTrigger"
                          onClick={() => toggleActionMenu(courrier.id)}
                          title="Actions"
                          type="button"
                        >
                          <MdMoreVert />
                        </button>
                        {openActionMenu === courrier.id && (
                          <div className="actionMenu" onClick={closeActionMenu}>
                            <CourrierActions
                              {...actionProps(courrier)}
                              onDelete={(id) => closeThen(() => handleDelete(id))}
                              onDownload={(id) => closeThen(() => { void courrierActions.handleAdaptiveDownload(id); })}
                              onEdit={(id) => closeThen(() => handleEdit(id))}
                              onEmail={(id) => closeThen(() => courrierActions.handleAdaptiveEmail(id))}
                              onView={(selectedCourrier) => closeThen(() => handleView(selectedCourrier))}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
