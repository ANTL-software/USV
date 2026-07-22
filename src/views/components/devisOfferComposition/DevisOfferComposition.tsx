import type { ReactElement } from 'react';
import { MdAdd, MdClose, MdFactCheck } from 'react-icons/md';
import Select from 'react-select';
import type { StylesConfig } from 'react-select';
import { QUOTE_CAMPAIGN_TYPE_LABELS } from '../../../utils/scripts/index.ts';
import { devisSelectStyles } from '../../../utils/styles/index.ts';
import type { QuoteCampaignType, QuoteCustomClause } from '../../../utils/types/index.ts';
import { Button } from '../button/index.ts';

interface DevisOfferCompositionProps {
  appointmentRate: number | undefined;
  campaignType: QuoteCampaignType;
  commercialCommissionRate: number | undefined;
  customClauses: QuoteCustomClause[];
  onAddCustomClause: () => void;
  onAppointmentRateChange: (amount: number | undefined) => void;
  onCampaignTypeChange: (campaignType: QuoteCampaignType) => void;
  onCommercialCommissionRateChange: (rate: number | undefined) => void;
  onRemoveCustomClause: (clauseId: string) => void;
  onUpdateCustomClause: <Field extends keyof Omit<QuoteCustomClause, 'id'>>(
    clauseId: string,
    field: Field,
    value: QuoteCustomClause[Field],
  ) => void;
}

type CampaignTypeOption = {
  label: string;
  value: QuoteCampaignType;
};

const campaignTypeOptions: CampaignTypeOption[] = Object.entries(QUOTE_CAMPAIGN_TYPE_LABELS).map(([value, label]) => ({
  value: value as QuoteCampaignType,
  label,
}));

const getOptionalAmount = (value: string): number | undefined => (value === '' ? undefined : Number(value));

export function DevisOfferComposition({
  appointmentRate,
  campaignType,
  commercialCommissionRate,
  customClauses,
  onAddCustomClause,
  onAppointmentRateChange,
  onCampaignTypeChange,
  onCommercialCommissionRateChange,
  onRemoveCustomClause,
  onUpdateCustomClause,
}: DevisOfferCompositionProps): ReactElement {
  return (
    <article className="devisView__panel">
      <div className="devisView__panel-header">
        <MdFactCheck />
        <div>
          <h2>3. Composition de l’offre</h2>
          <p>Définissez le modèle de rémunération adapté à la campagne.</p>
        </div>
      </div>

      <label className="devisView__field devisView__campaign-type">
        <span>Type de campagne</span>
        <Select<CampaignTypeOption, false>
          className="react-select-container"
          classNamePrefix="react-select"
          isSearchable={false}
          menuPlacement="top"
          menuPortalTarget={document.body}
          menuPosition="fixed"
          options={campaignTypeOptions}
          styles={devisSelectStyles as StylesConfig<CampaignTypeOption, false>}
          value={campaignTypeOptions.find((option) => option.value === campaignType) ?? null}
          onChange={(option) => option && onCampaignTypeChange(option.value)}
        />
      </label>

      {campaignType === 'commercial' ? (
        <div className="devisView__pricing-model">
          <div className="devisView__section-title">
            <strong>Commission commerciale</strong>
            <span>Le pourcentage est appliqué au montant HT de chaque vente conclue.</span>
          </div>
          <label className="devisView__pricing-line">
            <span>Commission par vente</span>
            <div>
              <input
                min="0"
                max="100"
                step="0.01"
                type="number"
                value={commercialCommissionRate ?? ''}
                onChange={(event) => onCommercialCommissionRateChange(getOptionalAmount(event.target.value))}
              />
              <small>%</small>
            </div>
          </label>
        </div>
      ) : (
        <div className="devisView__pricing-model">
          <div className="devisView__section-title">
            <strong>Tarification au rendez-vous qualifié</strong>
            <span>Définissez le tarif unitaire, puis ajoutez les conditions particulières nécessaires.</span>
          </div>
          <label className="devisView__pricing-line">
            <span>Rendez-vous pris</span>
            <div>
              <input
                min="0"
                step="1"
                type="number"
                value={appointmentRate ?? ''}
                onChange={(event) => onAppointmentRateChange(getOptionalAmount(event.target.value))}
              />
              <small>€ HT</small>
            </div>
          </label>

          <div className="devisView__custom-clauses">
            {customClauses.map((clause) => (
              <div key={clause.id} className={`devisView__custom-clause ${clause.included || clause.amount !== undefined ? 'is-active' : ''}`}>
                <input
                  aria-label="Intitulé de la clause"
                  placeholder="Clause tarifaire"
                  value={clause.label}
                  onChange={(event) => onUpdateCustomClause(clause.id, 'label', event.target.value)}
                />
                <input
                  aria-label="Montant de la clause"
                  disabled={clause.included}
                  min="0"
                  step="1"
                  type="number"
                  value={clause.amount ?? ''}
                  onChange={(event) => onUpdateCustomClause(clause.id, 'amount', getOptionalAmount(event.target.value))}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={clause.included}
                    onChange={(event) => onUpdateCustomClause(clause.id, 'included', event.target.checked)}
                  />
                  <span>Inclus</span>
                </label>
                <button type="button" aria-label="Supprimer la clause" onClick={() => onRemoveCustomClause(clause.id)}>
                  <MdClose />
                </button>
              </div>
            ))}
          </div>

          <Button style="white" className="devisView__add-clause" onClick={onAddCustomClause}>
            <MdAdd />
            <span>Ajouter une clause</span>
          </Button>
        </div>
      )}
    </article>
  );
}
