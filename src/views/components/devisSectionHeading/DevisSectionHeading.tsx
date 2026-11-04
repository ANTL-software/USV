import { useId } from 'react';
import type { ReactElement } from 'react';
import { QUOTE_SECTION_TITLE_PLACEHOLDER, QUOTE_SECTION_TITLE_SUGGESTIONS } from '../../../utils/scripts/index.ts';

interface DevisSectionHeadingProps {
  label: string;
  value: string;
  lineCount: number;
  onChange: (title: string) => void;
}

export function DevisSectionHeading({ label, value, lineCount, onChange }: DevisSectionHeadingProps): ReactElement {
  const suggestionsId = useId();
  return <div className="devisView__project-section-heading">
    <input aria-label={label} placeholder={QUOTE_SECTION_TITLE_PLACEHOLDER} title={QUOTE_SECTION_TITLE_PLACEHOLDER}
      maxLength={255} list={suggestionsId} value={value} onChange={(event) => onChange(event.target.value)} />
    <datalist id={suggestionsId}>{QUOTE_SECTION_TITLE_SUGGESTIONS.map((title) => <option key={title} value={title} />)}</datalist>
    <span>{lineCount} prestation(s) retenue(s)</span>
  </div>;
}
