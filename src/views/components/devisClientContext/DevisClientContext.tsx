import type { ReactElement } from 'react';
import { MdOutlineAddBusiness } from 'react-icons/md';
import { BUDGET_LABELS } from '../../../utils/scripts/index.ts';
import type { BudgetBand, QuoteFormChangeHandler, QuoteFormState } from '../../../utils/types/index.ts';

interface DevisClientContextProps {
  form: QuoteFormState;
  onFormChange: QuoteFormChangeHandler;
}

export function DevisClientContext({ form, onFormChange }: DevisClientContextProps): ReactElement {
  return (
    <article className="devisView__panel">
      <div className="devisView__panel-header">
        <MdOutlineAddBusiness />
        <div>
          <h2>2. Contexte client</h2>
          <p>Renseignez les coordonnées, le besoin et l’objectif de la proposition.</p>
        </div>
      </div>

      <div className="devisView__form-grid">
        <label className="devisView__field">
          <span>Entreprise</span>
          <input value={form.companyName} onChange={(event) => onFormChange('companyName', event.target.value)} />
        </label>
        <label className="devisView__field">
          <span>Interlocuteur</span>
          <input value={form.contactName} onChange={(event) => onFormChange('contactName', event.target.value)} />
        </label>
        <label className="devisView__field">
          <span>Fonction</span>
          <input value={form.contactRole} onChange={(event) => onFormChange('contactRole', event.target.value)} />
        </label>
        <label className="devisView__field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={(event) => onFormChange('email', event.target.value)} />
        </label>
        <label className="devisView__field">
          <span>Téléphone</span>
          <input type="tel" value={form.phone} onChange={(event) => onFormChange('phone', event.target.value)} />
        </label>
        <label className="devisView__field">
          <span>Budget pressenti</span>
          <select value={form.budgetBand} onChange={(event) => onFormChange('budgetBand', event.target.value as BudgetBand)}>
            {Object.entries(BUDGET_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="devisView__field devisView__field--full">
          <span>Besoin exprimé</span>
          <textarea rows={3} value={form.needSummary} onChange={(event) => onFormChange('needSummary', event.target.value)} />
        </label>
        <label className="devisView__field devisView__field--full">
          <span>Objectif principal</span>
          <textarea rows={3} value={form.objective} onChange={(event) => onFormChange('objective', event.target.value)} />
        </label>
      </div>
    </article>
  );
}
