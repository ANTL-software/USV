import type { ReactElement } from 'react';
import { MdCheckCircle, MdHandshake } from 'react-icons/md';
import { BILLING_LABELS, ENGAGEMENT_LABELS, TIMELINE_LABELS } from '../../../utils/scripts/index.ts';
import type {
  BillingRhythm,
  Engagement,
  QuoteFormChangeHandler,
  QuoteFormState,
  TemplateAssumption,
  Timeline,
} from '../../../utils/types/index.ts';

interface DevisCommercialTermsProps {
  assumptions: TemplateAssumption[];
  form: QuoteFormState;
  onFormChange: QuoteFormChangeHandler;
}

export function DevisCommercialTerms({
  assumptions,
  form,
  onFormChange,
}: DevisCommercialTermsProps): ReactElement {
  return (
    <article className="devisView__panel">
      <div className="devisView__panel-header">
        <MdHandshake />
        <div>
          <h2>4. Conditions commerciales</h2>
          <p>Définissez le calendrier, l’engagement et le rythme de facturation.</p>
        </div>
      </div>

      <div className="devisView__form-grid">
        <label className="devisView__field">
          <span>Délai de démarrage</span>
          <select value={form.timeline} onChange={(event) => onFormChange('timeline', event.target.value as Timeline)}>
            {Object.entries(TIMELINE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="devisView__field">
          <span>Engagement</span>
          <select value={form.engagement} onChange={(event) => onFormChange('engagement', event.target.value as Engagement)}>
            {Object.entries(ENGAGEMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="devisView__field">
          <span>Rythme de facturation</span>
          <select value={form.billingRhythm} onChange={(event) => onFormChange('billingRhythm', event.target.value as BillingRhythm)}>
            {Object.entries(BILLING_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="devisView__assumptions">
        {assumptions.map((assumption) => (
          <div key={assumption.id}>
            <MdCheckCircle />
            <span>{assumption.label}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
