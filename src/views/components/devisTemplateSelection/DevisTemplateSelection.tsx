import type { ChangeEvent, ReactElement } from 'react';
import { MdDraw } from 'react-icons/md';
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

export function DevisTemplateSelection({
  familyFilter,
  onFamilyFilterChange,
  onTemplateToggle,
  selectedTemplateIds,
  templates,
}: DevisTemplateSelectionProps): ReactElement {
  const handleFamilyChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    onFamilyFilterChange(event.target.value as TemplateFamily | 'all');
  };

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
          <select value={familyFilter} onChange={handleFamilyChange}>
            <option value="all">Toutes les familles</option>
            {Object.entries(FAMILY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
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
