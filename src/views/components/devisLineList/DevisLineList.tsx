import type { ReactElement } from 'react';
import type { QuoteLine } from '../../../utils/types/index.ts';

interface DevisLineListProps {
  amounts: Record<string, number | undefined>;
  lines: QuoteLine[];
  selection: Record<string, boolean>;
  onAmountChange: (lineId: string, amount: number | undefined) => void;
  onToggle: (lineId: string) => void;
}

export function DevisLineList({
  amounts,
  lines,
  selection,
  onAmountChange,
  onToggle,
}: DevisLineListProps): ReactElement {
  return (
    <div className="devisView__line-list">
      {lines.map((line) => (
        <article
          key={line.id}
          className={`devisView__line-card ${selection[line.id] || amounts[line.id] !== undefined ? 'is-active' : ''}`}
        >
          <div>
            <strong>{line.label}</strong>
            <p>{line.description}</p>
          </div>
          <div className="devisView__line-controls">
            <label>
              <input
                type="checkbox"
                checked={Boolean(selection[line.id])}
                onChange={() => onToggle(line.id)}
              />
              <span>Inclus</span>
            </label>
            <input
              aria-label={`Montant ${line.label}`}
              disabled={Boolean(selection[line.id])}
              min="0"
              step="1"
              type="number"
              value={amounts[line.id] ?? ''}
              onChange={(event) => {
                const amount = event.target.value === '' ? undefined : Number(event.target.value);
                onAmountChange(line.id, amount);
              }}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
