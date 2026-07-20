import type { ReactElement } from 'react';
import {
  MdFilterList,
  MdFilterListOff,
  MdNavigateBefore,
  MdNavigateNext,
  MdSearch,
} from 'react-icons/md';
import Select from 'react-select';

import type { ListeCourriersViewModel } from '../../../hooks/index.ts';
import {
  COURRIER_DIRECTION_OPTIONS,
  toCourrierSelectOptions,
} from '../../../utils/scripts/index.ts';
import type { CourrierSelectOption } from '../../../utils/scripts/index.ts';

interface CourrierListFiltersProps {
  viewModel: ListeCourriersViewModel;
}

export function CourrierListFilters({ viewModel }: CourrierListFiltersProps): ReactElement {
  const {
    clearAllFilters,
    columnFilters,
    currentPage,
    fieldOptions,
    filteredCourriers,
    handleFilterChange,
    handleSearchChange,
    hasActiveFilters,
    pagination,
    searchTerm,
    setCurrentPage,
    setShowFilters,
    showFilters,
  } = viewModel;
  const searchIsActive = Boolean(searchTerm.trim());

  return (
    <>
      <section className="searchSection" data-aos="fade-up" data-aos-delay="100">
        <div className="searchContainer desktopOnly">
          <MdSearch className="searchIcon" />
          <input
            type="text"
            placeholder="Nom, type, service..."
            value={searchTerm}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="searchInput"
          />
        </div>

        <button
          type="button"
          className={`filterToggleBtn ${showFilters ? 'active' : ''} ${hasActiveFilters ? 'hasFilters' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          title={showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
        >
          {showFilters ? <MdFilterListOff /> : <MdFilterList />}
          <span>Filtres</span>
          {hasActiveFilters && <span className="filterBadge" />}
        </button>

        {searchIsActive && (
          <div className="searchResults">
            <span className="resultsCount">
              {filteredCourriers.length} résultat{filteredCourriers.length > 1 ? 's' : ''} trouvé{filteredCourriers.length > 1 ? 's' : ''} pour &quot;{searchTerm}&quot;
            </span>
          </div>
        )}

        {!searchIsActive && pagination && pagination.totalPages > 1 && (
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
        )}
      </section>

      {showFilters && (
        <section className="filterSection" data-aos="fade-down">
          {([
            ['kind', 'Type...', fieldOptions.kind],
            ['department', 'Service...', fieldOptions.department],
            ['emitter', 'Expediteur...', fieldOptions.emitter],
            ['recipient', 'Destinataire...', fieldOptions.recipient],
          ] as const).map(([field, placeholder, optionState]) => (
            <div className="filterSelect" key={field}>
              <Select<CourrierSelectOption>
                value={columnFilters[field]
                  ? { value: columnFilters[field], label: columnFilters[field] }
                  : null}
                onChange={(option) => handleFilterChange(field, option?.value || '')}
                options={toCourrierSelectOptions(optionState.options)}
                isClearable
                placeholder={placeholder}
                className="react-select-container"
                classNamePrefix="react-select"
                isLoading={optionState.isLoading}
              />
            </div>
          ))}
          <div className="filterSelect">
            <Select<CourrierSelectOption>
              value={columnFilters.direction
                ? COURRIER_DIRECTION_OPTIONS.find((option) => option.value === columnFilters.direction) || null
                : null}
              onChange={(option) => handleFilterChange('direction', option?.value || '')}
              options={COURRIER_DIRECTION_OPTIONS}
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
                onChange={(event) => handleFilterChange('dateMin', event.target.value)}
                className="filterDateInput"
                max={columnFilters.dateMax || undefined}
                title="Date minimum"
              />
              <span className="filterDateSeparator">→</span>
              <input
                type="date"
                value={columnFilters.dateMax}
                onChange={(event) => handleFilterChange('dateMax', event.target.value)}
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
    </>
  );
}

export function CourrierMobileSearch({ viewModel }: CourrierListFiltersProps): ReactElement {
  return (
    <div className="mobileSearchContainer mobileOnly">
      <div className="searchWrapper">
        <MdSearch className="searchIcon" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={viewModel.searchTerm}
          onChange={(event) => viewModel.handleSearchChange(event.target.value)}
          className="searchInput"
        />
      </div>
    </div>
  );
}
