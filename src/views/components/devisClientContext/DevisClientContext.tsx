import type { ReactElement } from 'react';
import { MdOutlineAddBusiness } from 'react-icons/md';
import Select from 'react-select';
import type { StylesConfig } from 'react-select';
import { BUDGET_LABELS } from '../../../utils/scripts/index.ts';
import { devisSelectStyles } from '../../../utils/styles/index.ts';
import type { BudgetBand, QuoteFormChangeHandler, QuoteFormState } from '../../../utils/types/index.ts';

interface DevisClientContextProps {
  form: QuoteFormState;
  onFormChange: QuoteFormChangeHandler;
}

type BudgetOption = {
  label: string;
  value: BudgetBand;
};

export function DevisClientContext({ form, onFormChange }: DevisClientContextProps): ReactElement {
  const budgetOptions: BudgetOption[] = Object.entries(BUDGET_LABELS).map(([value, label]) => ({
    value: value as BudgetBand,
    label,
  }));

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
          <input placeholder="Maison Lelièvre" value={form.companyName} onChange={(event) => onFormChange('companyName', event.target.value)} />
        </label>
        <label className="devisView__field">
          <span>Interlocuteur</span>
          <input placeholder="Claire Moreau" value={form.contactName} onChange={(event) => onFormChange('contactName', event.target.value)} />
        </label>
        <label className="devisView__field">
          <span>Fonction</span>
          <input placeholder="Directrice commerciale" value={form.contactRole} onChange={(event) => onFormChange('contactRole', event.target.value)} />
        </label>
        <label className="devisView__field">
          <span>Email</span>
          <input type="email" placeholder="claire.moreau@maisonlelievre.fr" value={form.email} onChange={(event) => onFormChange('email', event.target.value)} />
        </label>
        <label className="devisView__field">
          <span>Téléphone</span>
          <input type="tel" placeholder="06 80 42 17 12" value={form.phone} onChange={(event) => onFormChange('phone', event.target.value)} />
        </label>
        <label className="devisView__field">
          <span>Budget pressenti</span>
          <Select
            className="react-select-container"
            classNamePrefix="react-select"
            isSearchable={false}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            options={budgetOptions}
            styles={devisSelectStyles as StylesConfig<BudgetOption, false>}
            value={budgetOptions.find((option) => option.value === form.budgetBand) ?? null}
            onChange={(option) => option && onFormChange('budgetBand', option.value)}
          />
        </label>
        <label className="devisView__field devisView__field--full">
          <span>Besoin exprimé</span>
          <textarea rows={3} placeholder="L’équipe veut relancer l’acquisition B2B sans réinternaliser toute la prospection." value={form.needSummary} onChange={(event) => onFormChange('needSummary', event.target.value)} />
        </label>
        <label className="devisView__field devisView__field--full">
          <span>Objectif principal</span>
          <textarea rows={3} placeholder="Obtenir un flux régulier de rendez-vous qualifiés avec des décideurs PME." value={form.objective} onChange={(event) => onFormChange('objective', event.target.value)} />
        </label>
      </div>
    </article>
  );
}
