import type { ReactElement } from 'react';
import { formatCurrency } from '../../../utils/scripts/index.ts';
import type { QuoteLine } from '../../../utils/types/index.ts';

interface DevisLineListProps {
  lines: QuoteLine[];
  selection: Record<string, boolean>;
  onToggle: (lineId: string) => void;
}

export function DevisLineList({ lines, selection, onToggle }: DevisLineListProps): ReactElement {
  return (
    <div className="devisView__line-list">
      {lines.map((line) => (
        <label key={line.id} className={`devisView__line-card ${selection[line.id] ? 'is-active' : ''}`}>
          <input
            type="checkbox"
            checked={Boolean(selection[line.id])}
            onChange={() => onToggle(line.id)}
          />
          <div>
            <strong>{line.label}</strong>
            <p>{line.description}</p>
          </div>
          <span>{formatCurrency(line.amount)} / {line.mode}</span>
        </label>
      ))}
    </div>
  );
}
