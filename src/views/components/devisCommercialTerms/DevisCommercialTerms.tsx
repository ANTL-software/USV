import type { ReactElement } from 'react';
import { MdCheckCircle, MdHandshake } from 'react-icons/md';
import Select from 'react-select';
import type { StylesConfig } from 'react-select';
import { BILLING_LABELS, ENGAGEMENT_LABELS, TIMELINE_LABELS } from '../../../utils/scripts/index.ts';
import { devisSelectStyles } from '../../../utils/styles/index.ts';
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

type TimelineOption = {
  label: string;
  value: Timeline;
};

type EngagementOption = {
  label: string;
  value: Engagement;
};

type BillingOption = {
  label: string;
  value: BillingRhythm;
};

export function DevisCommercialTerms({
  assumptions,
  form,
  onFormChange,
}: DevisCommercialTermsProps): ReactElement {
  const timelineOptions: TimelineOption[] = Object.entries(TIMELINE_LABELS).map(([value, label]) => ({
    value: value as Timeline,
    label,
  }));
  const engagementOptions: EngagementOption[] = Object.entries(ENGAGEMENT_LABELS).map(([value, label]) => ({
    value: value as Engagement,
    label,
  }));
  const billingOptions: BillingOption[] = Object.entries(BILLING_LABELS).map(([value, label]) => ({
    value: value as BillingRhythm,
    label,
  }));

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
          <Select
            className="react-select-container"
            classNamePrefix="react-select"
            isSearchable={false}
            menuPlacement="top"
            menuPortalTarget={document.body}
            menuPosition="fixed"
            options={timelineOptions}
            styles={devisSelectStyles as StylesConfig<TimelineOption, false>}
            value={timelineOptions.find((option) => option.value === form.timeline) ?? null}
            onChange={(option) => option && onFormChange('timeline', option.value)}
          />
        </label>
        <label className="devisView__field">
          <span>Engagement</span>
          <Select
            className="react-select-container"
            classNamePrefix="react-select"
            isSearchable={false}
            menuPlacement="top"
            menuPortalTarget={document.body}
            menuPosition="fixed"
            options={engagementOptions}
            styles={devisSelectStyles as StylesConfig<EngagementOption, false>}
            value={engagementOptions.find((option) => option.value === form.engagement) ?? null}
            onChange={(option) => option && onFormChange('engagement', option.value)}
          />
        </label>
        <label className="devisView__field">
          <span>Rythme de facturation</span>
          <Select
            className="react-select-container"
            classNamePrefix="react-select"
            isSearchable={false}
            menuPlacement="top"
            menuPortalTarget={document.body}
            menuPosition="fixed"
            options={billingOptions}
            styles={devisSelectStyles as StylesConfig<BillingOption, false>}
            value={billingOptions.find((option) => option.value === form.billingRhythm) ?? null}
            onChange={(option) => option && onFormChange('billingRhythm', option.value)}
          />
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
