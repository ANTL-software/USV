import type { ReactElement } from 'react';
import { MdDraw } from 'react-icons/md';
import Select from 'react-select';
import type { StylesConfig } from 'react-select';
import { devisSelectStyles } from '../../../utils/styles/index.ts';
import { FAMILY_LABELS } from '../../../utils/scripts/index.ts';
import type { QuoteTemplate, TemplateFamily } from '../../../utils/types/index.ts';
import { DevisTemplateGrid } from '../devisTemplateGrid/index.ts';

interface DevisTemplateSelectionProps {
  familyFilter: TemplateFamily | 'all';
  onFamilyFilterChange: (family: TemplateFamily | 'all') => void;
  onTemplateToggle: (templateId: string) => void;
  selectedTemplateIds: string[];
  templates: QuoteTemplate[];
}

type FamilyOption = {
  label: string;
  value: TemplateFamily | 'all';
};

export function DevisTemplateSelection({
  familyFilter,
  onFamilyFilterChange,
  onTemplateToggle,
  selectedTemplateIds,
  templates,
}: DevisTemplateSelectionProps): ReactElement {
  const familyOptions: FamilyOption[] = [
    { value: 'all' as const, label: 'Toutes les familles' },
    ...Object.entries(FAMILY_LABELS).map(([value, label]) => ({ value: value as TemplateFamily, label })),
  ];

  return (
    <article className="devisView__panel">
      <div className="devisView__panel-header">
        <MdDraw />
        <div>
          <h2>1. Sélection du modèle</h2>
          <p>La famille filtre le catalogue ; chaque carte reste sélectionnable indépendamment.</p>
        </div>
      </div>

      <div className="devisView__filters-grid">
        <label className="devisView__field">
          <span>Famille d’expertise</span>
          <Select
            className="react-select-container"
            classNamePrefix="react-select"
            isSearchable={false}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            options={familyOptions}
            styles={devisSelectStyles as StylesConfig<FamilyOption, false>}
            value={familyOptions.find((option) => option.value === familyFilter) ?? null}
            onChange={(option) => option && onFamilyFilterChange(option.value)}
          />
        </label>
      </div>

      <DevisTemplateGrid
        templates={templates}
        selectedTemplateIds={selectedTemplateIds}
        onToggle={onTemplateToggle}
      />
    </article>
  );
}
