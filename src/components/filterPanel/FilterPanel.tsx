import { useState } from 'react';
import { MdClose, MdRefresh } from 'react-icons/md';
import Button from '../button/Button';
import './filterPanel.scss';

export interface DateFilters {
  dateDebut: string | null;
  dateFin: string | null;
}

interface FilterPanelProps {
  filters: DateFilters;
  onFiltersChange: (filters: DateFilters) => void;
}

const FilterPanel = ({ filters, onFiltersChange }: FilterPanelProps) => {
  const [localFilters, setLocalFilters] = useState<DateFilters>(filters);

  const handleDateDebutChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value ? e.target.value : null;
    setLocalFilters((prev) => ({ ...prev, dateDebut: value }));
  };

  const handleDateFinChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value ? e.target.value : null;
    setLocalFilters((prev) => ({ ...prev, dateFin: value }));
  };

  const applyFilters = (): void => {
    onFiltersChange(localFilters);
  };

  const clearFilters = (): void => {
    const clearedFilters: DateFilters = { dateDebut: null, dateFin: null };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Boolean(filters.dateDebut || filters.dateFin);

  return (
    <div className="filterPanel">
      <div className="filterPanel__content">
        <div className="filterPanel__fields">
          <div className="filterPanel__field">
            <label htmlFor="dateDebut">Date début</label>
            <input
              type="date"
              id="dateDebut"
              value={localFilters.dateDebut || ''}
              onChange={handleDateDebutChange}
              max={localFilters.dateFin || undefined}
            />
          </div>

          <div className="filterPanel__field">
            <label htmlFor="dateFin">Date fin</label>
            <input
              type="date"
              id="dateFin"
              value={localFilters.dateFin || ''}
              onChange={handleDateFinChange}
              min={localFilters.dateDebut || undefined}
            />
          </div>
        </div>

        <div className="filterPanel__actions">
          <Button
            style="grey"
           
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            <MdClose /> Réinitialiser
          </Button>
          <Button
            style="orange"
           
            onClick={applyFilters}
          >
            <MdRefresh /> Appliquer
          </Button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="filterPanel__active">
          <span className="filterPanel__active-label">Filtres actifs:</span>
          {filters.dateDebut && (
            <span className="filterPanel__active-filter">
              Du {new Date(filters.dateDebut).toLocaleDateString('fr-FR')}
            </span>
          )}
          {filters.dateFin && (
            <span className="filterPanel__active-filter">
              Au {new Date(filters.dateFin).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
