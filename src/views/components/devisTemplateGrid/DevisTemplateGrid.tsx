import type { ReactElement } from 'react';
import { FAMILY_LABELS, STATUS_LABELS, getStatusTone } from '../../../utils/scripts/index.ts';
import type { QuoteTemplate } from '../../../utils/types/index.ts';

interface DevisTemplateGridProps {
  templates: QuoteTemplate[];
  selectedTemplateIds: string[];
  onToggle: (templateId: string) => void;
}

export function DevisTemplateGrid({
  templates,
  selectedTemplateIds,
  onToggle,
}: DevisTemplateGridProps): ReactElement {
  return (
    <div className="devisView__template-grid">
      {templates.map((template) => (
        <button
          key={template.id}
          type="button"
          className={`devisView__template-pick ${selectedTemplateIds.includes(template.id) ? 'is-selected' : ''}`}
          onClick={() => onToggle(template.id)}
        >
          <div className="devisView__template-head">
            <span className={`devisView__badge devisView__badge--${getStatusTone(template.status)}`}>
              {STATUS_LABELS[template.status]}
            </span>
            <small>{FAMILY_LABELS[template.family]}</small>
          </div>
          <strong>{template.title}</strong>
          <p>{template.description}</p>
        </button>
      ))}
    </div>
  );
}
